from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient

QDRANT_PATH = "./qdrant_db"
COLLECTION_NAME = "protocols-multilingual-e5-large"
EMBEDDING_MODEL = "intfloat/multilingual-e5-large"

def get_retriever(k=3):
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    vectorstore = QdrantVectorStore.from_existing_collection(
        embedding=embeddings,
        path=QDRANT_PATH,
        collection_name=COLLECTION_NAME,
    )
    return vectorstore.as_retriever(search_kwargs={"k": k})
