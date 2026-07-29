"""
OmniShop OS — Router Prompts

Intent classification and routing prompt templates.
"""

INTENT_CLASSIFICATION_PROMPT = """Classify the following user message into one of these intents:
- SEARCH: User wants to find/search for products
- VISUAL_SEARCH: User uploaded an image or wants visual product search
- COMPARE: User wants to compare two or more products
- CART: User wants to add/remove items, apply coupons, or checkout
- RECOMMEND: User wants personalized product recommendations
- GENERAL: General greeting, help request, or conversation

User message: {message}
Has image: {has_image}

Intent:"""

QUERY_REWRITE_PROMPT = """The initial search did not return satisfactory results. 
Rewrite the query to broaden or refine the search.

Original query: {original_query}
Original filters: {original_filters}
Number of results: {result_count}
User feedback: {user_feedback}

Rewritten query:"""
