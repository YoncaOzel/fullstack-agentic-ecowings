from rag.pdf_loader import get_vector_store


def retrieve_faq_context(query: str, top_k: int = 3) -> str:
    """
    Kullanıcının sorusuna en yakın FAQ/kural bölümlerini döndürür.
    """
    vector_store = get_vector_store()
    relevant_docs = vector_store.similarity_search(query, k=top_k)

    if not relevant_docs:
        return "İlgili bir bilgi bulunamadı."

    context_parts = []
    for i, doc in enumerate(relevant_docs, 1):
        page_num = doc.metadata.get("page", 0) + 1
        context_parts.append(
            f"[Bölüm {i} — Sayfa {page_num}]\n{doc.page_content}"
        )

    return "\n\n---\n\n".join(context_parts)
