import os
import json
import re
import pathlib
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from rich.console import Console
from rich.table import Table

# Configuration
SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()
QDRANT_PATH = str(SCRIPT_DIR / "../qdrant_db")
COLLECTION_NAME = "protocols-multilingual-e5-large"
EMBEDDING_MODEL = "intfloat/multilingual-e5-large"
TEST_SET_DIR = str(SCRIPT_DIR / "test_set")


def get_retriever(embeddings, qdrant_path, collection_name):
    """Initializes and returns a Qdrant retriever."""
    client = QdrantClient(path=qdrant_path)
    qdrant = QdrantVectorStore(
        client=client, collection_name=collection_name, embedding=embeddings
    )
    return qdrant.as_retriever(search_kwargs={"k": 5})


def extract_icd_codes(text):
    """Extracts ICD-10 codes from a given text."""
    return re.findall(r"[A-Z][0-9]{2}(?:\.[0-9]{1,2})?", text)


def normalize(s):
    """Strips and normalizes whitespace/invisible characters for reliable comparison."""
    return s.strip().replace("\u00a0", " ").replace("\u200b", "")


def main():
    """Main function to run the retriever evaluation."""
    console = Console()
    console.print(
        "[bold cyan]Retriever Evaluation Script[/bold cyan]", justify="center"
    )

    # 1. Initialize retriever
    console.print(f"Loading embedding model: [yellow]{EMBEDDING_MODEL}[/yellow]...")
    model_kwargs = {"device": "cpu"}
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL, model_kwargs=model_kwargs
    )
    retriever = get_retriever(embeddings, QDRANT_PATH, COLLECTION_NAME)
    console.print("✅ Retriever initialized.")

    # 2. Load test dataset
    test_files = [
        f for f in os.listdir(TEST_SET_DIR) if f.endswith(".json")
    ]
    if not test_files:
        console.print(
            f"[bold red]Error: No JSON files found in {TEST_SET_DIR}[/bold red]"
        )
        return

    console.print(f"Found {len(test_files)} test cases.")

    recall_at_1 = 0
    recall_at_3 = 0
    recall_at_5 = 0
    code_recall_hits = 0
    gt_in_codes_hits = 0
    all_results = []
    evaluated = 0

    # 3. Iterate through test files
    for filename in test_files:
        file_path = os.path.join(TEST_SET_DIR, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            test_case = json.load(f)

        query = (test_case.get("query") or "").strip()
        if not query:
            console.print(f"[red]Skipping file with empty query:[/red] {filename}")
            continue

        evaluated += 1

        # Normalize ground truth values
        ground_truth_file = normalize(test_case["source_file"])
        ground_truth_codes = set(test_case["icd_codes"])
        ground_truth_gt = test_case["gt"]

        # 4. Retrieve documents
        retrieved_docs = retriever.invoke(query)

        # Normalize retrieved filenames for reliable comparison
        retrieved_files = [
            normalize(doc.metadata.get("source_file", "Unknown"))
            for doc in retrieved_docs
        ]

        # Debug: show repr if top-1 looks like a match but isn't
        if retrieved_files and retrieved_files[0] != ground_truth_file:
            raw_gt = test_case["source_file"]
            raw_ret = retrieved_docs[0].metadata.get("source_file", "Unknown")
            if raw_gt.strip() == raw_ret.strip():
                console.print(
                    f"[bold yellow]⚠ Hidden char mismatch detected![/bold yellow]\n"
                    f"  GT  repr: {repr(raw_gt)}\n"
                    f"  Ret repr: {repr(raw_ret)}"
                )

        # 5. Evaluate retrieval
        retrieved_top_1 = retrieved_files[0] if retrieved_files else ""
        retrieved_top_3 = retrieved_files[:3]
        retrieved_top_5 = retrieved_files[:5]

        is_in_top_1 = ground_truth_file == retrieved_top_1
        is_in_top_3 = ground_truth_file in retrieved_top_3
        is_in_top_5 = ground_truth_file in retrieved_top_5

        if is_in_top_1:
            recall_at_1 += 1
        if is_in_top_3:
            recall_at_3 += 1
        if is_in_top_5:
            recall_at_5 += 1

        # 6. Display results for this query
        table = Table(
            title=f"[bold]Query:[/bold] [italic]{query[:100]}...[/italic]"
        )
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="magenta")

        table.add_row("Ground Truth File", ground_truth_file)
        table.add_row("Retrieved Top 1", retrieved_top_1)
        table.add_row(
            "Recall@1", "✅ [green]Hit[/green]" if is_in_top_1 else "❌ [red]Miss[/red]"
        )
        table.add_row("Retrieved Top 3", "\n".join(retrieved_top_3))
        table.add_row(
            "Recall@3", "✅ [green]Hit[/green]" if is_in_top_3 else "❌ [red]Miss[/red]"
        )
        table.add_row("Retrieved Top 5", "\n".join(retrieved_top_5))
        table.add_row(
            "Recall@5", "✅ [green]Hit[/green]" if is_in_top_5 else "❌ [red]Miss[/red]"
        )

        extracted_codes = set()
        if retrieved_docs:
            top_doc = retrieved_docs[0]
            codes = extract_icd_codes(top_doc.page_content)
            extracted_codes.update(codes)

        gt_in_extracted = ground_truth_gt in extracted_codes
        code_intersection = extracted_codes.intersection(ground_truth_codes)

        if gt_in_extracted:
            gt_in_codes_hits += 1
        if code_intersection:
            code_recall_hits += 1

        table.add_row("Extracted ICD Codes (from Top 1)", ", ".join(sorted(list(extracted_codes))))
        table.add_row("Ground Truth 'gt' in Extracted", "✅ [green]Hit[/green]" if gt_in_extracted else "❌ [red]Miss[/red]")
        table.add_row("Code Intersection", ", ".join(sorted(list(code_intersection))))

        console.print(table)

        # Store results
        all_results.append(
            {
                "query": query,
                "ground_truth_file": ground_truth_file,
                "retrieved_files": retrieved_files,
                "is_in_top_1": is_in_top_1,
                "is_in_top_3": is_in_top_3,
                "is_in_top_5": is_in_top_5,
                "extracted_codes": sorted(list(extracted_codes)),
                "ground_truth_codes": sorted(list(ground_truth_codes)),
                "ground_truth_gt": ground_truth_gt,
                "gt_in_extracted": gt_in_extracted,
                "code_intersection": sorted(list(code_intersection)),
            }
        )

    # 7. Report final metrics
    # Use evaluated count (skipping empty queries) as denominator
    total = evaluated if evaluated > 0 else 1
    recall_at_1_percent = (recall_at_1 / total) * 100
    recall_at_3_percent = (recall_at_3 / total) * 100
    recall_at_5_percent = (recall_at_5 / total) * 100
    code_recall_percent = (code_recall_hits / total) * 100
    gt_in_codes_percent = (gt_in_codes_hits / total) * 100

    summary_metrics = {
        "total_test_cases": len(test_files),
        "evaluated_test_cases": evaluated,
        "document_recall_at_1_percent": recall_at_1_percent,
        "document_recall_at_3_percent": recall_at_3_percent,
        "document_recall_at_5_percent": recall_at_5_percent,
        "code_recall_percent": code_recall_percent,
        "gt_in_extracted_codes_percent": gt_in_codes_percent,
    }

    metrics_table = Table(title="[bold]Overall Retrieval Metrics[/bold]")
    metrics_table.add_column("Metric", style="cyan")
    metrics_table.add_column("Value", style="bold green")

    metrics_table.add_row("Total Test Cases", str(summary_metrics["total_test_cases"]))
    metrics_table.add_row("Evaluated Test Cases", str(summary_metrics["evaluated_test_cases"]))
    metrics_table.add_row("Document Recall@1", f"{summary_metrics['document_recall_at_1_percent']:.2f}%")
    metrics_table.add_row("Document Recall@3", f"{summary_metrics['document_recall_at_3_percent']:.2f}%")
    metrics_table.add_row("Document Recall@5", f"{summary_metrics['document_recall_at_5_percent']:.2f}%")
    metrics_table.add_row("Code Recall (any intersection)", f"{summary_metrics['code_recall_percent']:.2f}%")
    metrics_table.add_row("'gt' Code Found", f"{summary_metrics['gt_in_extracted_codes_percent']:.2f}%")

    console.print(metrics_table)

    # 8. Save results
    output_path = SCRIPT_DIR / "retriever_evaluation_results.json"
    output_data = {"summary_metrics": summary_metrics, "results": all_results}
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    console.print(f"\n[bold green]✓ Results saved to {output_path}[/bold green]")


if __name__ == "__main__":
    main()