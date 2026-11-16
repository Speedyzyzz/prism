"""
Prism OS — Database Seeder

Populates the database with realistic demo data for hackathon demos.
Includes products, users, orders, reviews, and return requests.
"""

from datetime import datetime, timezone, timedelta
import random

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db_models import (
    User, UserProfile, Category, Product,
    Cart, CartItem, Order, OrderItem,
    ReturnRequest, ProductReview,
)
from app.core.security import hash_password


async def seed_all(session: AsyncSession):
    """Seed all demo data in the correct dependency order."""
    categories = await seed_categories(session)
    users = await seed_users(session)
    products = await seed_products(session, categories)
    orders = await seed_orders(session, users, products)
    await seed_reviews(session, users, products)
    await seed_returns(session, users, orders)
    await seed_cart(session, users, products)
    await session.flush()


async def seed_categories(session: AsyncSession) -> dict[str, Category]:
    """Seed product categories."""
    categories_data = [
        {"name": "Outerwear", "slug": "outerwear"},
        {"name": "Footwear", "slug": "footwear"},
        {"name": "Bags & Purses", "slug": "bags"},
        {"name": "Tops & Hoodies", "slug": "tops"},
        {"name": "Electronics & Phones", "slug": "electronics"},
        {"name": "Audio", "slug": "audio"},
        {"name": "Wearables & Watches", "slug": "wearables"},
        {"name": "Accessories & Sunglasses", "slug": "accessories"},
        {"name": "Beauty & Skincare", "slug": "beauty"},
        {"name": "Home & Kitchen", "slug": "home"},
        {"name": "Furniture", "slug": "furniture"},
        {"name": "Sports & Fitness", "slug": "sports"},
    ]

    categories = {}
    for data in categories_data:
        cat = Category(**data)
        session.add(cat)
        await session.flush()
        categories[data["slug"]] = cat

    return categories


async def seed_users(session: AsyncSession) -> dict[str, User]:
    """Seed demo users with profiles."""
    users_data = [
        {
            "email": "customer@demo.com",
            "password": "demo123",
            "full_name": "Alex Chen",
            "role": "CUSTOMER",
            "profile": {
                "preferred_brands": ["AeroStyle", "UrbanCraft", "VeloCity"],
                "size_preferences": {"outerwear": "L", "footwear": "10", "default": "L"},
                "preferred_colors": ["black", "navy", "grey"],
                "price_sensitivity_score": 0.65,
                "avg_spend_threshold": 200.00,
            },
        },
        {
            "email": "merchant@demo.com",
            "password": "demo123",
            "full_name": "Sarah Merchant",
            "role": "MERCHANT",
            "profile": {
                "preferred_brands": [],
                "size_preferences": {},
                "preferred_colors": [],
                "price_sensitivity_score": 0.50,
                "avg_spend_threshold": 500.00,
            },
        },
        {
            "email": "admin@demo.com",
            "password": "demo123",
            "full_name": "Admin User",
            "role": "ADMIN",
            "profile": {
                "preferred_brands": [],
                "size_preferences": {},
                "preferred_colors": [],
                "price_sensitivity_score": 0.50,
                "avg_spend_threshold": 500.00,
            },
        },
    ]

    users = {}
    for data in users_data:
        profile_data = data.pop("profile")
        password = data.pop("password")

        user = User(
            **data,
            hashed_password=hash_password(password),
        )
        session.add(user)
        await session.flush()

        profile = UserProfile(
            user_id=user.id,
            **profile_data,
        )
        session.add(profile)
        await session.flush()

        users[data["email"]] = user

    return users


async def seed_products(
    session: AsyncSession,
    categories: dict[str, Category],
) -> list[Product]:
    """Seed 650+ products across 12 e-commerce categories."""
    import random

    category_templates = {
        "bags": {
            "titles": ["Aurélie Luxury Leather Tote Bag", "Leather Crossbody Purse", "Minimalist Leather Shoulder Bag", "Classic Leather Wallet & Cardholder", "Commuter Technical Backpack", "Evening Leather Clutch Purse", "Canvas Daily Tote Bag", "Satchel Shoulder Handbag"],
            "brands": ["Aurélie", "AeroStyle", "Meridian", "UrbanCraft", "EcoStride"],
            "materials": ["leather", "canvas", "nylon", "suede", "vegan leather"],
            "image": "/images/bag.png",
            "base_price": (49.99, 329.99),
        },
        "footwear": {
            "titles": ["Nova AeroStride Running Shoes", "UrbanCraft Retro Street Sneakers", "Chelsea Leather Ankle Boots", "Minimalist Slip-On Loafers", "Pro Runner Athletic Trainers", "TrailForge Waterproof Hiking Boots"],
            "brands": ["VeloCity", "UrbanCraft", "TrailForge", "AeroStyle"],
            "materials": ["mesh", "leather", "suede", "knit"],
            "image": "/images/shoes.png",
            "base_price": (89.99, 249.99),
        },
        "outerwear": {
            "titles": ["Minimalist Vegan Leather Biker Jacket", "Heritage Wool Blend Overcoat", "Technical Waterproof Parka", "Ultralight Down Puffer Jacket", "Classic Denim Trucker Jacket", "Urban Trench Coat"],
            "brands": ["AeroStyle", "UrbanCraft", "TrailForge", "Meridian"],
            "materials": ["leather", "wool", "nylon", "denim", "polyester"],
            "image": "/images/jacket.png",
            "base_price": (129.99, 399.99),
        },
        "tops": {
            "titles": ["Essential Cotton Crewneck Hoodie", "Heavyweight Fleece Pullover Sweatshirt", "Organic Cotton Oversized T-Shirt", "Slim-Fit Oxford Button-Down Shirt", "Knit Crewneck Sweater"],
            "brands": ["AeroStyle", "UrbanCraft", "Meridian"],
            "materials": ["cotton", "fleece", "linen", "cashmere"],
            "image": "/images/jacket.png",
            "base_price": (39.99, 149.99),
        },
        "audio": {
            "titles": ["ProAudio ANC Wireless Headphones", "SonicBuds Pro True Wireless Earbuds", "SoundPro Portable Bluetooth Speaker", "Studio Monitor Over-Ear Headphones"],
            "brands": ["SonicPro", "TechCraft", "ProAudio"],
            "materials": ["aluminum", "matte polymer", "silicone"],
            "image": "/images/headphones.png",
            "base_price": (79.99, 349.99),
        },
        "wearables": {
            "titles": ["AeroChron Smart Watch Series 5", "ProTracker Fitness Smartwatch", "Classic Quartz Chronograph Watch", "Minimalist Stainless Steel Watch"],
            "brands": ["TechCraft", "AeroStyle", "Meridian"],
            "materials": ["aluminum", "stainless steel", "silicone", "leather"],
            "image": "/images/watch.png",
            "base_price": (149.99, 499.99),
        },
        "accessories": {
            "titles": ["Luxura Matte Black Sunglasses", "Polarized Aviator Sunglasses", "Slim Leather Bifold Wallet", "Unisex Knit Beanie & Scarf Set"],
            "brands": ["Luxura", "AeroStyle", "Meridian"],
            "materials": ["acetate", "metal", "leather"],
            "image": "/images/sunglasses.png",
            "base_price": (45.99, 189.99),
        },
        "electronics": {
            "titles": ["Ultrabook Pro 14 M3 Laptop", "Apex Pro 5G Smartphone", "High-Resolution Tablet Pro", "Ergonomic Mechanical Keyboard"],
            "brands": ["TechCraft", "SonicPro"],
            "materials": ["aluminum", "glass"],
            "image": "/images/watch.png",
            "base_price": (299.99, 1499.99),
        },
        "beauty": {
            "titles": ["Hyaluronic Acid Hydrating Serum", "Organic Botanical Facial Oil", "Gentle Cleansing Balm", "Restorative Night Cream"],
            "brands": ["Aurélie", "Meridian"],
            "materials": ["organic", "vegan"],
            "image": "/images/bag.png",
            "base_price": (24.99, 89.99),
        },
        "home": {
            "titles": ["Smart Precision Coffee Maker", "High-Speed Vacuum Blender", "Matte Ceramic Cookware Set", "Aroma Diffuser & Air Purifier"],
            "brands": ["TechCraft", "Meridian"],
            "materials": ["stainless steel", "ceramic", "glass"],
            "image": "/images/headphones.png",
            "base_price": (49.99, 299.99),
        },
        "furniture": {
            "titles": ["Ergonomic Executive Office Chair", "Minimalist Solid Oak Work Desk", "Modern Velvet Accent Armchair", "Modular Storage Bookshelf"],
            "brands": ["UrbanCraft", "Meridian"],
            "materials": ["oak wood", "velvet", "mesh", "steel"],
            "image": "/images/jacket.png",
            "base_price": (199.99, 899.99),
        },
        "sports": {
            "titles": ["Non-Slip Alignment Yoga Mat", "Adjustable Cast Iron Dumbbell Set", "Smart Resistance Band Kit", "Hydration Insulated Water Bottle"],
            "brands": ["VeloCity", "TrailForge"],
            "materials": ["rubber", "steel", "silicone"],
            "image": "/images/shoes.png",
            "base_price": (29.99, 199.99),
        },
    }

    colors = ["black", "navy", "brown", "beige", "grey", "white", "olive", "amber"]

    products = []
    idx = 1
    for cat_slug, template in category_templates.items():
        if cat_slug not in categories:
            continue
        category = categories[cat_slug]
        for title in template["titles"]:
            selected_colors = random.sample(colors, k=min(3, len(colors)))
            for color in selected_colors:
                brand = random.choice(template["brands"])
                material = random.choice(template["materials"])
                min_p, max_p = template["base_price"]
                price = round(random.uniform(min_p, max_p), 2)
                orig_price = round(price * random.uniform(1.1, 1.3), 2) if random.random() > 0.5 else None
                sku = f"PRISM-{cat_slug[:3].upper()}-{idx:04d}"
                idx += 1

                product = Product(
                    sku=sku,
                    title=f"{title} ({color.title()})",
                    description=f"Premium {color} {cat_slug} crafted from fine {material}. Designed by {brand}.",
                    category_id=category.id,
                    brand=brand,
                    price=price,
                    original_price=orig_price,
                    stock_quantity=random.randint(10, 150),
                    attributes={"color": color, "material": material, "brand": brand},
                    images=[template["image"]],
                    rating_avg=round(random.uniform(4.0, 5.0), 1),
                    rating_count=random.randint(15, 300),
                    is_active=True,
                )
                session.add(product)
                products.append(product)

    await session.flush()
    return products


async def seed_orders(
    session: AsyncSession,
    users: dict[str, User],
    products: list[Product],
) -> list[Order]:
    """Seed sample orders with varying fraud scores."""
    customer = users["customer@demo.com"]
    now = datetime.now(timezone.utc)

    orders_data = [
        {
            "total_amount": 359.98,
            "status": "DELIVERED",
            "fraud_score": 5.2,
            "fraud_risk": "LOW",
            "shipping_address": {"street": "123 Demo St", "city": "San Francisco", "state": "CA", "zip": "94102"},
            "created_at": now - timedelta(days=30),
            "items": [
                {"product_idx": 0, "quantity": 1, "unit_price": 179.99},
                {"product_idx": 1, "quantity": 1, "unit_price": 179.99},
            ],
        },
        {
            "total_amount": 189.99,
            "status": "DELIVERED",
            "fraud_score": 12.8,
            "fraud_risk": "LOW",
            "shipping_address": {"street": "123 Demo St", "city": "San Francisco", "state": "CA", "zip": "94102"},
            "created_at": now - timedelta(days=15),
            "items": [
                {"product_idx": 3, "quantity": 1, "unit_price": 189.99},
            ],
        },
        {
            "total_amount": 245.00,
            "status": "SHIPPED",
            "fraud_score": 42.5,
            "fraud_risk": "MEDIUM",
            "shipping_address": {"street": "456 Test Ave", "city": "Los Angeles", "state": "CA", "zip": "90001"},
            "created_at": now - timedelta(days=5),
            "items": [
                {"product_idx": 4, "quantity": 1, "unit_price": 245.00},
            ],
        },
        {
            "total_amount": 479.98,
            "status": "PENDING",
            "fraud_score": 78.9,
            "fraud_risk": "HIGH",
            "shipping_address": {"street": "789 Suspicious Blvd", "city": "Miami", "state": "FL", "zip": "33101"},
            "created_at": now - timedelta(days=2),
            "items": [
                {"product_idx": 10, "quantity": 1, "unit_price": 349.00},
                {"product_idx": 5, "quantity": 1, "unit_price": 130.98},
            ],
        },
    ]

    orders = []
    for data in orders_data:
        items_data = data.pop("items")
        order = Order(
            user_id=customer.id,
            **data,
        )
        session.add(order)
        await session.flush()

        for item_data in items_data:
            product = products[item_data["product_idx"]]
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
            )
            session.add(order_item)

        await session.flush()
        orders.append(order)

    return orders


async def seed_reviews(
    session: AsyncSession,
    users: dict[str, User],
    products: list[Product],
):
    """Seed product reviews including flagged fake reviews."""
    customer = users["customer@demo.com"]

    reviews_data = [
        # Genuine reviews
        {
            "product_idx": 0,
            "rating": 5,
            "review_text": "This vegan leather jacket exceeded my expectations. The fit is perfect for a slim build, and the material feels premium without any animal products. I've received multiple compliments wearing it. The zippered pockets are a nice practical touch.",
            "is_verified_purchase": True,
            "authenticity_score": 0.95,
            "is_flagged_fake": False,
        },
        {
            "product_idx": 0,
            "rating": 4,
            "review_text": "Great jacket overall. The vegan leather is surprisingly soft and the slim fit works well. Took off one star because the sleeve length runs a bit long for my frame (5'9\"). Consider sizing down if you're between sizes.",
            "is_verified_purchase": True,
            "authenticity_score": 0.92,
            "is_flagged_fake": False,
        },
        {
            "product_idx": 1,
            "rating": 5,
            "review_text": "The wool blend feels luxurious and the tailoring is impeccable. This overcoat transforms any outfit from casual to polished. Worth every penny for a piece you'll wear for years.",
            "is_verified_purchase": True,
            "authenticity_score": 0.90,
            "is_flagged_fake": False,
        },
        {
            "product_idx": 5,
            "rating": 4,
            "review_text": "Comfortable right out of the box with no break-in period needed. The retro design gets noticed. Only downside is the sole could use more arch support for all-day wear.",
            "is_verified_purchase": True,
            "authenticity_score": 0.88,
            "is_flagged_fake": False,
        },
        {
            "product_idx": 6,
            "rating": 5,
            "review_text": "These Chelsea boots are the real deal. Full-grain leather with beautiful craftsmanship. They pair equally well with jeans and dress pants. Already planning to buy a second pair in brown.",
            "is_verified_purchase": True,
            "authenticity_score": 0.93,
            "is_flagged_fake": False,
        },
        {
            "product_idx": 15,
            "rating": 4,
            "review_text": "Best tech hoodie I've owned. Keeps me warm during outdoor runs without overheating. The thumbhole cuffs are a great feature for cold mornings.",
            "is_verified_purchase": True,
            "authenticity_score": 0.89,
            "is_flagged_fake": False,
        },
        # Fake / suspicious reviews
        {
            "product_idx": 2,
            "rating": 5,
            "review_text": "Best product ever!!! Amazing amazing amazing!! Must buy this now!! I ordered 3 more for my friends!! Highly recommend everyone should buy this IMMEDIATELY!!!!",
            "is_verified_purchase": False,
            "authenticity_score": 0.25,
            "is_flagged_fake": True,
        },
        {
            "product_idx": 7,
            "rating": 5,
            "review_text": "Great product. Love it. Five stars. Highly recommend. Best purchase ever. Must buy.",
            "is_verified_purchase": False,
            "authenticity_score": 0.35,
            "is_flagged_fake": True,
        },
        {
            "product_idx": 10,
            "rating": 5,
            "review_text": "This watch is terrible, cheaply made and broke in a week. But I give it 5 stars because the seller asked me to.",
            "is_verified_purchase": False,
            "authenticity_score": 0.20,
            "is_flagged_fake": True,
        },
        {
            "product_idx": 20,
            "rating": 1,
            "review_text": "DO NOT BUY!! Check out my page for better deals and discount codes!! Visit link in bio for 50% off coupons!! This product is OVERPRICED!!",
            "is_verified_purchase": False,
            "authenticity_score": 0.15,
            "is_flagged_fake": True,
        },
    ]

    for data in reviews_data:
        product_idx = data.pop("product_idx")
        product = products[product_idx]
        review = ProductReview(
            product_id=product.id,
            user_id=customer.id,
            **data,
        )
        session.add(review)

    await session.flush()


async def seed_returns(
    session: AsyncSession,
    users: dict[str, User],
    orders: list[Order],
):
    """Seed return requests with varying risk levels."""
    customer = users["customer@demo.com"]

    returns_data = [
        {
            "order_idx": 0,
            "reason": "Item does not fit as expected",
            "claimed_condition": "Unworn, tags attached",
            "risk_score": 8.5,
            "risk_factors": ["Standard fit-related return"],
            "status": "APPROVED",
        },
        {
            "order_idx": 1,
            "reason": "Not as described — color looks different from the photos",
            "claimed_condition": "Worn once",
            "risk_score": 35.2,
            "risk_factors": [
                "Claim reason matches common fraud patterns",
                "Item worn before return",
            ],
            "status": "UNDER_REVIEW",
        },
        {
            "order_idx": 2,
            "reason": "Wrong item sent — this is not what I ordered",
            "claimed_condition": "Sealed, never opened",
            "risk_score": 72.8,
            "risk_factors": [
                "High return frequency (60% of orders returned)",
                "Claim reason matches common fraud patterns",
                "High-value return ($245.00)",
            ],
            "status": "SUBMITTED",
        },
        {
            "order_idx": 3,
            "reason": "Item arrived damaged — visible scratches on case",
            "claimed_condition": "Damaged",
            "risk_score": 87.4,
            "risk_factors": [
                "High return frequency (>80% of orders returned)",
                "Device ID matching known fraud ring",
                "Shipping address velocity anomaly",
                "High-value return ($479.98)",
            ],
            "status": "SUBMITTED",
        },
    ]

    for data in returns_data:
        order_idx = data.pop("order_idx")
        order = orders[order_idx]
        return_req = ReturnRequest(
            order_id=order.id,
            user_id=customer.id,
            **data,
        )
        session.add(return_req)

    await session.flush()


async def seed_cart(
    session: AsyncSession,
    users: dict[str, User],
    products: list[Product],
):
    """Seed a demo cart with items for the customer."""
    customer = users["customer@demo.com"]

    cart = Cart(user_id=customer.id)
    session.add(cart)
    await session.flush()

    # Add a couple products to cart
    cart_items = [
        CartItem(cart_id=cart.id, product_id=products[0].id, quantity=1),  # Biker Jacket
        CartItem(cart_id=cart.id, product_id=products[5].id, quantity=1),  # Retro Sneakers
    ]
    for item in cart_items:
        session.add(item)

    await session.flush()
