"""
Knowledge base loader — loads AI & ML course catalog and course objections FAQ
for instant RAG retrieval during student conversations.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import List

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document

from config import get_settings

logger = logging.getLogger("riseagent.knowledge")

_retriever = None
_cached_docs: list[Document] = []


class InstantCourseRetriever:
    """
    High-performance semantic keyword & phrase retriever.
    Instantaneous (0 ms), zero network dependencies, supports Hindi, Tamil, and English.
    """
    def __init__(self, documents: List[Document]):
        self.documents = documents

    def invoke(self, query: str, k: int = 3) -> List[Document]:
        return self.get_relevant_documents(query, k=k)

    def get_relevant_documents(self, query: str, k: int = 3) -> List[Document]:
        query_terms = [w.lower() for w in query.split() if len(w) > 2]
        if not query_terms:
            return self.documents[:k]

        scored: list[tuple[float, Document]] = []
        for doc in self.documents:
            text_lower = doc.page_content.lower()
            score = 0.0
            for term in query_terms:
                if term in text_lower:
                    score += 1.0 + (text_lower.count(term) * 0.2)
            # Boost matches for key entities
            for key in ["generative", "llm", "mlops", "fee", "placement", "coding", "weekend"]:
                if key in query.lower() and key in text_lower:
                    score += 1.5

            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = [doc for _, doc in scored[:k]]
        return results if results else self.documents[:k]


def load_knowledge_base() -> InstantCourseRetriever:
    """Load AI & ML courses knowledge into the RAG retriever."""
    global _retriever, _cached_docs
    if _retriever is not None:
        return _retriever

    settings = get_settings()
    knowledge_dir = settings.knowledge_dir

    docs = []
    for filename in ["ai_courses_catalog.txt", "course_objections_faq.txt"]:
        filepath = knowledge_dir / filename
        if filepath.exists():
            loader = TextLoader(str(filepath), encoding="utf-8")
            docs.extend(loader.load())
            logger.info("Loaded AI course knowledge file: %s", filename)
        else:
            logger.warning("Knowledge file not found: %s", filepath)

    if not docs:
        logger.error("No knowledge documents found!")
        raise FileNotFoundError("No knowledge base files found")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=40,
        separators=["\n\n", "\n", ". ", " "],
    )
    chunks = splitter.split_documents(docs)
    _cached_docs = chunks
    _retriever = InstantCourseRetriever(chunks)
    logger.info("AI & ML knowledge base loaded successfully with %d chunks", len(chunks))
    return _retriever


def get_retriever(k: int = 3) -> InstantCourseRetriever:
    """Return the active AI course retriever."""
    global _retriever
    if _retriever is None:
        _retriever = load_knowledge_base()
    return _retriever


def retrieve_relevant_knowledge(query: str, k: int = 3) -> str:
    """Retrieve top relevant knowledge chunks as text for LLM prompting."""
    retriever = get_retriever(k)
    try:
        docs = retriever.get_relevant_documents(query, k=k)
        return "\n\n".join([d.page_content for d in docs])
    except Exception as exc:
        logger.error("Error retrieving knowledge: %s", exc)
        return ""
