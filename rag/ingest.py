import os
import glob
from langchain_community.document_loaders import PyPDFLoader
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tqdm import tqdm

# Configuration
PDF_DIR = "files"
QDRANT_PATH = "../qdrant_db"
COLLECTION_NAME = "protocols-multilingual-e5-large"
EMBEDDING_MODEL = "intfloat/multilingual-e5-large"

def load_documents(pdf_dir):
    documents = []
    if not os.path.exists(pdf_dir):
        print(f"Error: Directory {pdf_dir} not found.")
        return []
    
    # Use glob to find all PDF files
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {pdf_dir}")
        return []

    print(f"Found {len(pdf_files)} PDF files.")
    
    for pdf_path in tqdm(pdf_files, desc="Loading PDFs"):
        try:
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            # Add source filename to metadata
            for doc in docs:
                 doc.metadata["source_file"] = os.path.basename(pdf_path)
            documents.extend(docs)
        except Exception as e:
            print(f"Error loading {pdf_path}: {e}")
            
    return documents

def main():
    print(f"Loading documents from {PDF_DIR}...")
    docs = load_documents(PDF_DIR)
    if not docs:
        print("No documents loaded.")
        return
    print(f"Loaded {len(docs)} document pages.")

    print("Splitting documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    splits = text_splitter.split_documents(docs)
    print(f"Created {len(splits)} chunks.")

    print(f"Initializing embeddings ({EMBEDDING_MODEL})...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    print(f"Creating/Updating Qdrant vector store at {QDRANT_PATH}...")
    
    QdrantVectorStore.from_documents(
        documents=splits,
        embedding=embeddings,
        path=QDRANT_PATH,
        collection_name=COLLECTION_NAME,
        force_recreate=False
    )
    
    print("Ingestion complete.")

if __name__ == "__main__":
    main()
