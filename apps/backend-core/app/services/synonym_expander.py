"""
Pronym & Natural Language Term Expander for Prism Retrieval Engine.

Maps colloquial user prompt terms (e.g., 'purse', 'handbag', 'kicks', 'mobile', 'earbuds', 'watch')
to canonical commerce categories, subcategories, and search tags.
"""

from typing import List, Set

SYNONYM_MAP = {
    # Bags & Accessories
    "purse": ["bag", "handbag", "tote", "crossbody", "satchel", "clutch", "leather bag"],
    "handbag": ["purse", "bag", "tote", "shoulder bag", "satchel"],
    "tote": ["bag", "handbag", "canvas tote", "leather tote"],
    "wallet": ["cardholder", "bifold", "leather wallet", "money clip", "accessory"],
    "backpack": ["rucksack", "daypack", "travel bag", "bag"],
    "clutch": ["purse", "evening bag", "handbag"],

    # Footwear
    "sneakers": ["shoes", "running shoes", "footwear", "kicks", "trainers", "athletic shoes"],
    "shoes": ["sneakers", "boots", "loafers", "footwear", "running shoes"],
    "runners": ["running shoes", "sneakers", "athletic shoes"],
    "boots": ["leather boots", "footwear", "shoes", "chelsea boots"],
    "kicks": ["sneakers", "shoes"],

    # Outerwear & Apparel
    "jacket": ["coat", "biker jacket", "outerwear", "parka", "overcoat"],
    "coat": ["overcoat", "jacket", "trench coat", "parka", "outerwear"],
    "hoodie": ["sweatshirt", "pullover", "fleece", "hooded jacket", "apparel"],
    "sweatshirt": ["hoodie", "pullover", "apparel"],
    "shirt": ["t-shirt", "tee", "top", "button-down", "apparel"],
    "dress": ["evening dress", "maxi dress", "gown", "apparel"],
    "jeans": ["denim", "pants", "trousers", "bottoms"],

    # Electronics & Tech
    "mobile": ["phone", "smartphone", "cellphone", "iphone", "android"],
    "phone": ["mobile", "smartphone", "cellphone", "tech"],
    "laptop": ["computer", "notebook", "ultrabook", "macbook"],
    "computer": ["laptop", "desktop", "workstation"],
    "headphones": ["earbuds", "headset", "audio", "anc headphones", "earphones"],
    "earbuds": ["headphones", "earphones", "wireless earbuds", "audio"],
    "speaker": ["bluetooth speaker", "audio", "soundbar"],

    # Wearables & Accessories
    "watch": ["smartwatch", "chronograph", "timepiece", "wearable"],
    "smartwatch": ["watch", "fitness tracker", "wearable"],
    "sunglasses": ["eyewear", "shades font", "sun glasses", "accessories"],
    "jewellery": ["jewelry", "necklace", "ring", "bracelet", "earrings"],
    "jewelry": ["jewellery", "necklace", "ring", "bracelet"],

    # Home & Kitchen & Furniture
    "furniture": ["chair", "table", "desk", "sofa", "home"],
    "chair": ["armchair", "office chair", "furniture", "seating"],
    "desk": ["table", "office desk", "furniture", "workspace"],
    "kitchen": ["cookware", "blender", "coffee maker", "kettle"],
    "beauty": ["skincare", "serum", "perfume", "cosmetics"],
}

def expand_query_terms(query: str) -> List[str]:
    """
    Given a user query string, return a list of original terms plus all expanded synonyms.
    """
    words = [w.strip().lower() for w in query.split() if len(w.strip()) > 2]
    expanded: Set[str] = set(words)

    for word in words:
        if word in SYNONYM_MAP:
            for syn in SYNONYM_MAP[word]:
                expanded.add(syn.lower())

    return list(expanded)
