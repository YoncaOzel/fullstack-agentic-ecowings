import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VECTOR_STORE_PATH = os.path.join(_BASE_DIR, "data", "vector_store")
FAQ_PDF_PATH = os.path.join(_BASE_DIR, "data", "faq.pdf")


def build_vector_store() -> FAISS:
    embeddings = OpenAIEmbeddings(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="text-embedding-3-small",
    )

    if os.path.exists(VECTOR_STORE_PATH):
        print("✅ Loading existing vector store...")
        return FAISS.load_local(
            VECTOR_STORE_PATH,
            embeddings,
            allow_dangerous_deserialization=True,
        )

    print("📄 Reading and indexing FAQ PDF...")

    if not os.path.exists(FAQ_PDF_PATH):
        raise FileNotFoundError(
            f"FAQ PDF not found: {FAQ_PDF_PATH}\n"
            "Please place your PDF at data/faq.pdf."
        )

    loader = PyPDFLoader(FAQ_PDF_PATH)
    pages = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_documents(pages)
    print(f"   → {len(pages)} pages, {len(chunks)} chunks created")

    vector_store = FAISS.from_documents(chunks, embeddings)
    os.makedirs(VECTOR_STORE_PATH, exist_ok=True)
    vector_store.save_local(VECTOR_STORE_PATH)

    print(f"✅ Vector store saved: {VECTOR_STORE_PATH}")
    return vector_store


_vector_store: FAISS | None = None


def get_vector_store() -> FAISS:
    global _vector_store
    if _vector_store is None:
        _vector_store = build_vector_store()
    return _vector_store
