# MVC Architecture Analysis - Auth App Project

## Overview
This Next.js e-commerce application implements the **Model-View-Controller (MVC)** pattern using Next.js App Router architecture, Prisma ORM, NextAuth for authentication, and React components.

---

## 1. PROJECT STRUCTURE MAPPING

```
auth-app-simple/
├── prisma/                    # 📊 MODEL LAYER
│   ├── schema.prisma         # Database schema definitions
│   ├── migrations/           # Database version control
│   └── seed.js              # Initial data seeding
│
├── lib/                       # 🔧 SHARED UTILITIES & STATE MANAGEMENT
│   ├── prisma.js            # Prisma client instance
│   ├── hash.js              # Password hashing logic
│   └── cartContext.js       # Cart state management (React Context)
│
├── pages/api/                 # 🎮 CONTROLLER LAYER
│   ├── auth/[...nextauth].js  # Authentication controller
│   ├── user/
│   │   ├── create.js          # User creation logic
│   │   ├── auth.js            # User authentication endpoint
│   │   └── product.js         # User product fetching
│   ├── products/[id].js       # Product management controller
│   ├── cart/
│   │   ├── index.js           # Cart GET/POST operations
│   │   ├── clear.js           # Clear cart logic
│   │   └── item/[id].js       # Individual cart item operations
│   └── hello.js               # Example endpoint
│
├── pages/                     # 🖼️ VIEW LAYER (Next.js Pages)
│   ├── login.js              # Login form & authentication UI
│   ├── register.js           # Registration form UI
│   ├── dashboard/
│   │   ├── index.js          # Dashboard router
│   │   ├── admin.js          # Admin dashboard view
│   │   ├── user.js           # User dashboard view
│   │   └── components/       # Layout components
│   ├── products/
│   │   ├── index.js          # Admin product listing
│   │   ├── create.js         # Create product form
│   │   ├── edit.js           # Edit product form
│   │   ├── delete.js         # Delete confirmation
│   │   └── user-index.js     # User product catalog view
│   └── cart/
│       └── index.js          # Cart display & checkout UI
│
├── components/                # 🧩 REUSABLE VIEW COMPONENTS
│   ├── Navbar.js             # Navigation component
│   ├── AdminNavbar.js        # Admin navigation
│   └── dashboard/components/
│       ├── AdminLayout.js    # Admin layout wrapper
│       ├── UserLayout.js     # User layout wrapper
│       └── AuroraParticles.js # Visual effect component
│
├── middleware.js              # 🛡️ REQUEST PIPELINE
│   # Authentication & Authorization middleware
│
├── _app.js                   # Global app wrapper with providers
└── _document.js              # Document structure
```

---

## 2. MODEL LAYER (Database & Data Structures)

### Location: `prisma/schema.prisma`

The Model Layer defines the data structure and relationships:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  name          String?
  role          String    # "admin" or "user"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]  # OAuth relationships
  sessions      Session[]  # Session management
  cart          Cart?      # One-to-one relationship
}

model Product {
  id          String    @id @default(cuid())
  name        String
  price       Int
  description String?
  stock       Int
  image       String?
  createdAt   DateTime  @default(now())
  cartItems   CartItem[] # Products in carts
}

model Cart {
  id        String    @id @default(cuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id])
  items     CartItem[] # Cart line items
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  
  @@unique([cartId, productId]) # One item per cart per product
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires      DateTime
}
```

### Key Data Relationships:
- **User → Cart**: One-to-One (each user has one cart)
- **Cart → CartItem**: One-to-Many (cart has multiple items)
- **Product → CartItem**: One-to-Many (product appears in multiple carts)
- **User → Sessions**: One-to-Many (user can have multiple sessions)
- **User → Accounts**: One-to-Many (OAuth account linking)

### Prisma Client Instance: `lib/prisma.js`
```javascript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
prisma.$connect()
  .then(() => console.log("✅ Prisma connected"))
  .catch((error) => console.error("❌ Prisma error", error));

export default prisma;
```
*Every API controller imports this singleton instance to query the database.*

---

## 3. CONTROLLER LAYER (Business Logic & API Routes)

### Location: `pages/api/`

Controllers handle HTTP requests, validate data, execute business logic, and return responses.

#### 3.1 Authentication Controller: `pages/api/auth/[...nextauth].js`

**Purpose**: Handles login, session management, and JWT tokens.

```javascript
// Credential verification logic
async authorize(credentials) {
  // 1. Find user in database
  const user = await prisma.user.findUnique({
    where: { email: credentials.email }
  });
  
  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(
    credentials.password, 
    user.password
  );
  
  // 3. Return user data with role
  return {
    id: user.id,
    email: user.email,
    role: user.role  // Used for authorization
  };
}

// JWT Token callback - adds user role to token
async jwt({ token, user }) {
  if (user) {
    token.role = user.role; // Persist role in JWT
  }
  return token;
}

// Session callback - makes role available in session
async session({ session, token }) {
  session.user.role = token.role;
  return session;
}
```

**Flow**: 
1. User enters credentials → 2. Controller queries User model → 3. Password verification → 4. Create JWT with role → 5. Return session

---

#### 3.2 User Controller: `pages/api/user/create.js`

**Purpose**: Handle user registration with validation and password hashing.

```javascript
export default async function handler(req, res) {
  // 1. VALIDATE REQUEST METHOD
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  // 2. VALIDATE INPUT DATA
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Invalid inputs" });
  }

  // 3. CHECK FOR DUPLICATE EMAIL
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  // 4. HASH PASSWORD (business logic from lib)
  const hashedPassword = await hashPassword(password);

  // 5. CREATE USER IN DATABASE (Model)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "user"  // Default role
    }
  });

  // 6. RETURN RESPONSE (exclude password)
  return res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}
```

**Security Utility**: `lib/hash.js`
```javascript
import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10); // 10 salt rounds
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

---

#### 3.3 Cart Controller: `pages/api/cart/index.js`

**Purpose**: Handle cart operations (GET cart, POST add item).

```javascript
export default async function handler(req, res) {
  // 1. VERIFY USER IS AUTHENTICATED
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  // 2. GET REQUEST - Retrieve user's cart
  if (req.method === "GET") {
    try {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true  // Nested query: get product details
            }
          }
        }
      });

      // Create cart if it doesn't exist
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId }
        });
      }

      return res.status(200).json(cart);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching cart" });
    }
  }

  // 3. POST REQUEST - Add item to cart
  if (req.method === "POST") {
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: "Invalid product or insufficient stock" });
    }

    // Upsert cart item (create or update quantity)
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId }
      },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity }
    });

    return res.status(200).json(cartItem);
  }
}
```

**Authentication Check Pattern**: All controllers verify the session:
```javascript
const session = await getServerSession(req, res, authOptions);
if (!session) return res.status(401).json({ message: "Unauthorized" });
```

---

#### 3.4 Product Controller: `pages/api/products/[id].js`

**Purpose**: Update/Delete products (Admin only).

```javascript
export default async function handler(req, res) {
  // 1. VERIFY ADMIN ROLE
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  // 2. PUT - Update product
  if (req.method === "PUT") {
    const { name, price, stock, description, image } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        image
      }
    });

    return res.status(200).json(product);
  }

  // 3. DELETE - Remove product
  if (req.method === "DELETE") {
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: "Product deleted" });
  }
}
```

---

### Controller Pattern Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/[...nextauth]` | POST | Session | Authenticate credentials → JWT |
| `/api/user/create` | POST | Public | Register new user |
| `/api/user/auth` | POST | Public | Verify credentials |
| `/api/user/product` | GET | Private | Fetch user's products (admin) |
| `/api/cart` | GET/POST | Private | Get/add cart items |
| `/api/cart/clear` | DELETE | Private | Clear entire cart |
| `/api/cart/item/[id]` | DELETE | Private | Remove specific item |
| `/api/products/[id]` | PUT/DELETE | Admin | Update/delete product |

---

## 4. VIEW LAYER (UI & Components)

### Location: `pages/` and `components/`

The View Layer presents data to users and captures their interactions.

#### 4.1 Page Components: `pages/login.js`

**Purpose**: Render login form and handle authentication UI.

```javascript
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // 1. Call NextAuth signIn (communicates with Controller)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (res?.ok) {
      // 2. Verify session updated
      const session = await getSession();
      
      // 3. Route-Based Authorization (MVC flow)
      if (session.user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (session.user.role === "user") {
        router.push("/dashboard/user");
      }
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      {error && <div>{error}</div>}
    </form>
  );
}
```

**Data Flow**: 
1. User enters credentials → 2. handleSubmit → 3. signIn() calls `/api/auth/callback/credentials` → 4. Controller verifies → 5. Session returns role → 6. View updates route

---

#### 4.2 Dashboard Page: `pages/dashboard/user.js`

**Purpose**: Display user products catalog and add-to-cart functionality.

```javascript
function ProductTable({ products, loading }) {
  const { addToCart, itemCount } = useCart();  // From CartContext
  const [addingProductId, setAddingProductId] = useState(null);

  const handleAddToCart = async (productId) => {
    setAddingProductId(productId);
    
    // 1. Call Cart Controller via context
    const success = await addToCart(productId, 1);
    
    // 2. Update UI with new item count
    if (success) {
      showNotification(itemCount + 1);
    }
    
    setAddingProductId(null);
  };

  return (
    <table>
      {products.map((product) => (
        <tr key={product.id}>
          <td>{product.name}</td>
          <td>{product.price}</td>
          <td>
            <button 
              onClick={() => handleAddToCart(product.id)}
              disabled={addingProductId === product.id}
            >
              {addingProductId === product.id ? "Adding..." : "Add to Cart"}
            </button>
          </td>
        </tr>
      ))}
    </table>
  );
}

// Server-side props: fetch data from database via Controller
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: "/login" } };
  }

  return { props: { session } };
}
```

---

#### 4.3 Reusable Components: `components/Navbar.js`

**Purpose**: Shared navigation UI across pages.

```javascript
export default function Navbar({ userName, userRole }) {
  const { itemCount } = useCart();  // Access shared cart state
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav>
      <Link href="/products/user-index">Products</Link>
      <Link href="/cart">
        Cart
        {itemCount > 0 && <span>{itemCount}</span>}
      </Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
```

---

#### 4.4 Layout Components: `pages/dashboard/components/AdminLayout.js`

**Purpose**: Provide consistent structure for dashboard pages.

```javascript
export default function AdminLayout({ userName, children }) {
  return (
    <div className="flex h-screen">
      <AdminNavbar userName={userName} />
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}

// Usage in admin.js:
// <AdminLayout userName={userName}>
//   <ProductTable products={products} />
// </AdminLayout>
```

---

### View Layer State Management: `lib/cartContext.js`

**Purpose**: Share cart state across views without prop drilling.

```javascript
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Fetch cart from Controller
  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");  // Calls Controller
    if (res.ok) {
      const data = await res.json();
      setCart(data);
      setItemCount(data.items?.length || 0);
    }
  }, []);

  // Add item to cart via Controller
  const addToCart = async (productId, quantity = 1) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity })
    });
    if (res.ok) {
      await fetchCart();  // Refresh cart view
      return true;
    }
    return false;
  };

  useEffect(() => {
    const session = await getSession();
    if (session) fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
```

**Wraps app in `pages/_app.js`**:
```javascript
export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}
```

---

## 5. DATA FLOW DIAGRAM

### User Registration Flow (Model ← Controller ← View)

```
┌─────────────────────────────────────────────────────────┐
│ VIEW LAYER: pages/register.js                           │
│ • Form component captures input                         │
│ • handleSubmit() sends data to API                      │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► POST /api/user/create
              │
┌─────────────▼───────────────────────────────────────────┐
│ CONTROLLER LAYER: pages/api/user/create.js             │
│ • Validate inputs                                       │
│ • Check email uniqueness                               │
│ • Hash password (business logic)                       │
│ • Call Model to save data                              │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► prisma.user.create({ data })
              │
┌─────────────▼───────────────────────────────────────────┐
│ MODEL LAYER: prisma/schema.prisma                      │
│ • User table                                            │
│ • Generate CUID, timestamps                            │
│ • Enforce uniqueness on email                          │
│ • Return created user                                  │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► User object (sans password)
              │
┌─────────────▼───────────────────────────────────────────┐
│ CONTROLLER: Return response                            │
│ • 201 Created                                           │
│ • User data                                            │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► Response JSON
              │
┌─────────────▼───────────────────────────────────────────┐
│ VIEW LAYER: pages/register.js                          │
│ • Parse response                                        │
│ • Show success message                                 │
│ • Redirect to login                                    │
└─────────────────────────────────────────────────────────┘
```

---

### User Login & Session Flow (Model → Controller → View)

```
┌────────────────────────────────────────────────────────┐
│ VIEW: pages/login.js                                   │
│ User enters credentials, clicks "Login"                │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ├─► signIn("credentials", { email, password })
                  │
┌─────────────────▼──────────────────────────────────────┐
│ CONTROLLER: pages/api/auth/[...nextauth].js            │
│ CredentialsProvider.authorize()                        │
│ 1. Receive credentials                                 │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ├─► prisma.user.findUnique({ email })
                  │
┌─────────────────▼──────────────────────────────────────┐
│ MODEL: Retrieve user from database                     │
│ • User record with hashed password                     │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ├─► User object
                  │
┌─────────────────▼──────────────────────────────────────┐
│ CONTROLLER: Verify password                           │
│ bcrypt.compare(password, user.password)               │
│ → true/false                                           │
└─────────────────┬──────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    VALID ✓          INVALID ✗
         │                 │
    ┌────▼─────────┐   ┌───▼──────────┐
    │ Create JWT   │   │ Throw error  │
    │ with role    │   │ "Invalid credentials"
    └────┬─────────┘   └───┬──────────┘
         │                 │
         └────────┬────────┘
                  │
         ┌────────▼──────────────────┐
         │ Session created/failed    │
         └────────┬──────────────────┘
                  │
                  ├─► Session data with role
                  │
┌─────────────────▼──────────────────────────────────────┐
│ VIEW: pages/login.js                                   │
│ res.ok? → Route based on role:                        │
│   • admin → /dashboard/admin                          │
│   • user → /dashboard/user                            │
│   • error → Show error message                        │
└────────────────────────────────────────────────────────┘
```

---

### Add to Cart Flow (View → Controller → Model → View)

```
┌─────────────────────────────────────────────────────────┐
│ VIEW: pages/dashboard/user.js                           │
│ User clicks "Add to Cart" button                        │
│ handleAddToCart(productId)                              │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► useCart().addToCart(productId, 1)
              │
┌─────────────▼───────────────────────────────────────────┐
│ STATE: lib/cartContext.js                              │
│ CartProvider.addToCart()                                │
│ POST /api/cart { productId, quantity }                 │
└─────────────┬───────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────┐
│ CONTROLLER: pages/api/cart/index.js                    │
│ 1. Verify session (get userId)                        │
│ 2. Validate product exists                            │
│ 3. Check stock availability                           │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► prisma.cartItem.upsert()
              │   (create or increment quantity)
              │
┌─────────────▼───────────────────────────────────────────┐
│ MODEL: Update CartItem                                  │
│ • Create if new: { cartId, productId, quantity: 1 }   │
│ • Update if exists: { quantity: +1 }                  │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► CartItem object (updated)
              │
┌─────────────▼───────────────────────────────────────────┐
│ CONTROLLER: Return 200 OK                              │
│ { cartItemId, quantity, ... }                          │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► Response JSON
              │
┌─────────────▼───────────────────────────────────────────┐
│ STATE: lib/cartContext.js                              │
│ 1. Response success                                    │
│ 2. Call fetchCart() → GET /api/cart                   │
│    Retrieve updated cart with all items               │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► Updated cart object
              │
┌─────────────▼───────────────────────────────────────────┐
│ STATE: Update React state                              │
│ setCart(data)                                          │
│ setItemCount(data.items.length)                       │
└─────────────┬───────────────────────────────────────────┘
              │
              ├─► Re-render with new item count
              │
┌─────────────▼───────────────────────────────────────────┐
│ VIEW: pages/dashboard/user.js & components/Navbar.js   │
│ • Show notification "✅ Cart has 3 items!"            │
│ • Navbar displays itemCount badge                      │
│ • Product table button returns to normal              │
└─────────────────────────────────────────────────────────┘
```

---

## 6. MIDDLEWARE & REQUEST PIPELINE

### Location: `middleware.js`

Middleware acts as the **gatekeeper** before requests reach pages/controllers.

```javascript
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1️⃣ SKIP AUTH ROUTES (allow NextAuth to handle)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2️⃣ GET JWT TOKEN
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });

  // 3️⃣ UNAUTHENTICATED ACCESS TO DASHBOARD
  if (!token && pathname.startsWith("/dashboard")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 4️⃣ ROLE-BASED ACCESS CONTROL
  if (token) {
    // Only admins can access /dashboard/admin
    if (
      pathname.startsWith("/dashboard/admin") &&
      token.role !== "admin" &&
      token.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Only users can access /dashboard/user
    if (
      pathname.startsWith("/dashboard/user") &&
      token.role !== "user" &&
      token.role !== "USER"
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // 5️⃣ PASS THROUGH ALLOWED REQUESTS
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]  // Only intercept dashboard routes
};
```

### Middleware Flow

```
Incoming Request
      ↓
┌─────────────────────────────────────┐
│ middleware.js                       │
│ pathname = /dashboard/admin         │
└──────────┬──────────────────────────┘
           │
    ┌──────┴─────────┐
    │                │
 Is /api/auth?    No
    │
   Yes
    │
    └──→ NextResponse.next() → Continue
           │
    ┌──────┴─────────────┐
    │                    │
 Has JWT token?      No  │
    │                    │
   Yes                   │
    │             ┌──────▼─────────┐
    │             │ Return 401     │
    │             │ Unauthorized   │
    │             └────────────────┘
    │
    ├──────┬─────────────────┐
    │      │                 │
role=admin  role=user  role=other
    │      │                 │
   ✓      ✓ if /dashboard/user  ✗
    │      │                 │
    │      │          ┌──────▼──────┐
    │      │          │ Return 403  │
    │      │          │ Forbidden   │
    │      │          └─────────────┘
    │      │
    └──────┴──→ NextResponse.next()
                Continue to page/controller
```

---

## 7. AUTHENTICATION INTEGRATION WITH MVC

### Authentication Flow in Context

```
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE LAYER                                                 │
│ • Intercepts all /dashboard requests                            │
│ • Validates JWT token from cookie                              │
│ • Checks role permissions (admin vs user)                       │
│ • Returns 401 (Unauthorized) or 403 (Forbidden) or allows       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ CONTROLLER LAYER (/api/)                                         │
│ • Most controllers call: const session = getServerSession()    │
│ • Verify session exists (user is logged in)                    │
│ • Extract userId and role from session                         │
│ • Some controllers check: session.user.role === "admin"        │
│ • Return 401 or 403 if verification fails                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ MODEL LAYER (Prisma)                                             │
│ • Execute queries with verified userId/role                    │
│ • Database enforces relationships (User → Cart → Product)      │
│ • Return data to controller                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Authentication Files

| File | Purpose |
|------|---------|
| `pages/api/auth/[...nextauth].js` | Main auth controller - handles login credentials, JWT creation |
| `lib/hash.js` | Business logic - hash/verify passwords |
| `middleware.js` | Request pipeline - validate tokens, enforce roles |
| `pages/login.js` | View - login form UI |
| `pages/register.js` | View - registration form UI |
| `components/Navbar.js` | View - logout button, session display |

### Session Structure

```javascript
// After login, session object contains:
{
  user: {
    id: "cuid_abc123...",       // From User model
    email: "user@example.com",   // From User model
    role: "user" or "admin",     // From User model + JWT callback
  },
  expires: "2025-02-24T..."     // NextAuth managed
}

// Accessed in pages/controllers via:
// - getSession() [client-side]
// - getServerSession(req, res, authOptions) [server-side]
```

---

## 8. FOLDER INTERCONNECTIONS

### How Folders Communicate

```
pages/login.js (VIEW)
    ↓
    └─→ signIn() calls NextAuth
         ↓
pages/api/auth/[...nextauth].js (CONTROLLER)
    ↓
    ├─→ hashPassword from lib/hash.js (UTILITY)
    ├─→ prisma from lib/prisma.js (MODEL ACCESS)
    │
    └─→ prisma.user.findUnique() queries MODEL
         ↓
         └─→ Returns User object
              ↓
pages/login.js (VIEW)
    ↓
    └─→ getSession() retrieves role
         └─→ Router redirects: /dashboard/admin or /dashboard/user


pages/dashboard/user.js (VIEW - PAGE)
    ↓
    ├─→ getServerSideProps() with getSession()
    │   (verifies authentication at build time)
    ├─→ useCart() from lib/cartContext.js (STATE)
    │   └─→ addToCart()
    │       ↓
    │       └─→ fetch("/api/cart", POST)
    │            ↓
    │ pages/api/cart/index.js (CONTROLLER)
    │            ├─→ getServerSession() (verify auth)
    │            ├─→ prisma.cart.findUnique()
    │            └─→ prisma.cartItem.upsert()
    │                 (queries MODEL)
    │                 ↓
    │                 Returns CartItem
    │            ↓
    │ pages/api/cart/index.js
    │    └─→ Response.json(cartItem)
    │
    └─→ cartContext.js calls setCart()
         └─→ Re-renders pages/dashboard/user.js
              └─→ Navbar.js shows updated itemCount


pages/products/index.js (ADMIN VIEW)
    ↓
    ├─→ getServerSideProps() (server auth check)
    ├─→ fetch("/api/user/product") 
         ↓
pages/api/user/product.js (CONTROLLER)
    ├─→ getServerSession() (verify admin)
    └─→ prisma.product.findMany()
         ↓ (queries MODEL)
         └─→ Return products[]
              ↓
pages/products/index.js
    └─→ setProducts(data)
         └─→ Renders product list UI
```

---

## 9. SPECIFIC FILE EXAMPLES FOR EACH MVC LAYER

### MODEL LAYER Examples

**File**: [prisma/schema.prisma](prisma/schema.prisma)

```prisma
// Defines data structure
model User {
  id     String @id @default(cuid())
  email  String @unique
  role   String  // Determines authorization level
  cart   Cart?   // One user has one cart
}

model Product {
  id    String @id @default(cuid())
  name  String
  price Int
  stock Int    // Business logic: check before adding to cart
}

model CartItem {
  id        String @id @default(cuid())
  quantity  Int    @default(1)
  @@unique([cartId, productId])  // Constraint: prevent duplicates
}
```

---

### CONTROLLER LAYER Examples

**File 1**: [pages/api/user/create.js](pages/api/user/create.js)

```javascript
// Business Logic: User Registration
export default async function handler(req, res) {
  // Validate → Hash → Store → Return
  const { name, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({ data: { ... } });
  res.status(201).json(user);
}
```

**File 2**: [pages/api/cart/index.js](pages/api/cart/index.js)

```javascript
// Business Logic: Cart Management
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (req.method === "GET") {
    // Retrieve user's cart with products
    const cart = await prisma.cart.findUnique({
      include: { items: { include: { product: true } } }
    });
    res.json(cart);
  }
  
  if (req.method === "POST") {
    // Add item → Update quantity → Return item
    const cartItem = await prisma.cartItem.upsert({...});
    res.json(cartItem);
  }
}
```

**File 3**: [pages/api/products/[id].js](pages/api/products/[id].js)

```javascript
// Business Logic: Product Management (Admin)
export default async function handler(req, res) {
  // Admin authorization check
  if (session.user.role !== "admin") return res.status(403);
  
  if (req.method === "PUT") {
    // Update product
    const product = await prisma.product.update({...});
    res.json(product);
  }
}
```

---

### VIEW LAYER Examples

**File 1**: [pages/login.js](pages/login.js)

```javascript
// Presents login form, handles credential submission
function LoginPage() {
  const [email, setEmail] = useState("");
  
  async function handleSubmit(e) {
    // Calls Controller
    const res = await signIn("credentials", { email, password });
    
    // Controller returns session with role
    if (res?.ok) {
      const session = await getSession();
      // Routes based on Model data (role)
      if (session.user.role === "admin") router.push("/dashboard/admin");
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**File 2**: [pages/dashboard/user.js](pages/dashboard/user.js)

```javascript
// Displays product catalog, manages cart interaction
function ProductTable({ products }) {
  const { addToCart, itemCount } = useCart();  // Gets from Controller via context
  
  const handleAddToCart = async (productId) => {
    // Calls Controller via React Context
    const success = await addToCart(productId, 1);
    // Updates View based on response
    if (success) showNotification(itemCount + 1);
  };
  
  return (
    <table>
      {products.map(p => (
        <tr>
          <td>{p.name}</td>
          <td>
            <button onClick={() => handleAddToCart(p.id)}>
              Add to Cart
            </button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

**File 3**: [components/Navbar.js](components/Navbar.js)

```javascript
// Displays cart count, user info, logout
export default function Navbar() {
  const { itemCount } = useCart();  // From Model via Controller
  
  const handleLogout = async () => {
    // Calls Controller to end session
    await signOut({ callbackUrl: "/login" });
  };
  
  return (
    <nav>
      <span>Cart: {itemCount} items</span>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
```

---

### UTILITY LAYER Examples

**File**: [lib/prisma.js](lib/prisma.js)

```javascript
// Singleton Prisma client (imported by all controllers)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
prisma.$connect();

export default prisma;  // Used in all API routes
```

**File**: [lib/hash.js](lib/hash.js)

```javascript
// Password hashing utilities (called by controllers)
import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

**File**: [lib/cartContext.js](lib/cartContext.js)

```javascript
// React Context for cart state management
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  
  const addToCart = async (productId, quantity) => {
    // Calls Controller: POST /api/cart
    const res = await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity })
    });
    if (res.ok) {
      await fetchCart();  // Refresh from Controller
    }
  };
  
  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}
```

---

## 10. REQUEST LIFECYCLE EXAMPLE: "Add Product to Cart"

### Complete MVC Request Flow

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 1: VIEW LAYER - User Interaction                          │
├────────────────────────────────────────────────────────────────┤
│ File: pages/dashboard/user.js                                  │
│ User clicks "Add to Cart" button for Product #123             │
│ onClick → handleAddToCart(productId: "prod_123", quantity: 1) │
└────────────────────┬───────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────────┐
│ STEP 2: STATE MANAGEMENT - Coordinate Request                  │
├────────────────────────────────────────────────────────────────┤
│ File: lib/cartContext.js                                        │
│ CartProvider.addToCart()                                        │
│ → setLoading(true)                                              │
│ → fetch("/api/cart", {                                          │
│     method: "POST",                                             │
│     headers: { "Content-Type": "application/json" },           │
│     body: JSON.stringify({ productId: "prod_123", quantity: 1 })
│   })                                                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ STEP 3: REQUEST PIPELINE - Validate Authorization              │
├──────────────────────────────────────────────────────────────────┤
│ File: middleware.js                                              │
│ pathname = "/api/cart"                                          │
│ → Is it /api/auth? No                                           │
│ → Get JWT token from cookie                                    │
│ → Token exists and valid? Yes                                  │
│ → Check role for /dashboard/* ? N/A (not a dashboard route)   │
│ → NextResponse.next() - Continue to API route                 │
└────────────────┬──────────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────────┐
│ STEP 4: CONTROLLER - Business Logic                              │
├──────────────────────────────────────────────────────────────────┤
│ File: pages/api/cart/index.js                                   │
│                                                                   │
│ 1. Verify Authentication:                                        │
│    const session = await getServerSession(req, res, authOptions)│
│    if (!session) return res.status(401).json(...)              │
│                                                                   │
│ 2. Extract User Data:                                            │
│    const userId = session.user.id  // From JWT token           │
│                                                                   │
│ 3. Parse Request Body:                                           │
│    const { productId, quantity } = req.body                    │
│    // { productId: "prod_123", quantity: 1 }                   │
│                                                                   │
│ 4. Validate Product:                                             │
│    const product = await prisma.product.findUnique({           │
│      where: { id: "prod_123" }                                 │
│    })                                                             │
│    if (!product || product.stock < quantity) {                 │
│      return res.status(400).json({ message: "Out of stock" }) │
│    }                                                              │
│                                                                   │
│ 5. Get/Create User's Cart:                                      │
│    let cart = await prisma.cart.findUnique({                   │
│      where: { userId }                                          │
│    })                                                              │
│    if (!cart) {                                                  │
│      cart = await prisma.cart.create({                         │
│        data: { userId }                                         │
│      })                                                            │
│    }                                                              │
└────────────────┬──────────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────────┐
│ STEP 5: MODEL LAYER - Data Persistence                           │
├──────────────────────────────────────────────────────────────────┤
│ File: prisma/schema.prisma & Database                            │
│                                                                   │
│ 6. Upsert Cart Item:                                             │
│    const cartItem = await prisma.cartItem.upsert({              │
│      where: {                                                     │
│        cartId_productId: {                                       │
│          cartId: "cart_xyz",                                     │
│          productId: "prod_123"                                   │
│        }                                                           │
│      },                                                            │
│      update: { quantity: { increment: 1 } },  // If exists     │
│      create: { cartId, productId, quantity: 1 }  // If new    │
│    })                                                              │
│                                                                   │
│ Database Actions:                                                 │
│ • Check UNIQUE([cartId, productId]) constraint                  │
│ • If CartItem exists → UPDATE quantity = 2                      │
│ • If CartItem doesn't exist → INSERT new row                   │
│ • Return: {                                                       │
│     id: "ci_abc123",                                             │
│     cartId: "cart_xyz",                                          │
│     productId: "prod_123",                                       │
│     quantity: 1  (or 2 if already existed)                      │
│   }                                                               │
└────────────────┬──────────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────────┐
│ STEP 6: CONTROLLER - Format Response                             │
├──────────────────────────────────────────────────────────────────┤
│ File: pages/api/cart/index.js                                   │
│                                                                   │
│ return res.status(200).json({                                    │
│   id: "ci_abc123",                                               │
│   cartId: "cart_xyz",                                            │
│   productId: "prod_123",                                         │
│   quantity: 1,                                                    │
│   createdAt: "2025-02-15T10:30:00Z"                             │
│ })                                                                │
└────────────────┬──────────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────────┐
│ STEP 7: STATE MANAGEMENT - Process Response                      │
├──────────────────────────────────────────────────────────────────┤
│ File: lib/cartContext.js (continued)                            │
│                                                                   │
│ if (res.ok) {                                                     │
│   // REFETCH ENTIRE CART TO SYNC STATE                          │
│   const cartData = await fetch("/api/cart").json()             │
│   // Response: {                                                  │
│   //   id: "cart_xyz",                                           │
│   //   userId: "user_abc",                                       │
│   //   items: [                                                   │
│   //     {                                                        │
│   //       id: "ci_abc123",                                      │
│   //       quantity: 1,                                          │
│   //       product: {                                            │
│   //         id: "prod_123",                                    │
│   //         name: "Product Name",                              │
│   //         price: 50000,                                       │
│   //         stock: 100                                          │
│   //       }                                                       │
│   //     }                                                        │
│   //   ]                                                          │
│   // }                                                             │
│                                                                   │
│   setCart(cartData)                                              │
│   setItemCount(cartData.items.length)  // 1                     │
│   setLoading(false)                                              │
│   return true                                                     │
│ }                                                                 │
└────────────────┬──────────────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────────────┐
│ STEP 8: VIEW LAYER - Render Updated UI                           │
├──────────────────────────────────────────────────────────────────┤
│ File: pages/dashboard/user.js                                   │
│                                                                   │
│ // In handleAddToCart():                                         │
│ const success = await addToCart("prod_123", 1)                 │
│ if (success) {                                                    │
│   showNotification(itemCount + 1)  // Shows: "Cart has 1 item!" │
│   setAddingProductId(null)  // Clear loading state              │
│ }                                                                 │
│                                                                   │
│ // Context subscribers re-render:                               │
│ File: components/Navbar.js                                       │
│ const { itemCount } = useCart()  // Now returns 1               │
│ // Navbar displays: <span>Cart: 1 items</span>                 │
│                                                                   │
│ // Toast notification shows (3 seconds):                         │
│ <div>✅ Keranjang berisi 1 item!</div>                          │
│                                                                   │
│ // Product button state returns to normal:                       │
│ <button disabled={false}>Add to Cart</button>                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. AUTHORIZATION MATRIX

### Role-Based Access Control

| Resource | Public | User | Admin | Middleware | Controller |
|----------|--------|------|-------|------------|-----------|
| `/login` | ✓ | ✓ | ✓ | Allow | N/A |
| `/register` | ✓ | ✓ | ✓ | Allow | N/A |
| `/dashboard` | ✗ | ✓ | ✓ | Block 401 | N/A |
| `/dashboard/user` | ✗ | ✓ | ✗ | Block 403 | N/A |
| `/dashboard/admin` | ✗ | ✗ | ✓ | Block 403 | N/A |
| `/api/cart` | ✗ | ✓ | ✓ | Allow | Check 401 |
| `/api/products/[id]` PUT/DELETE | ✗ | ✗ | ✓ | Allow | Check 403 |
| `/api/user/create` | ✓ | ✓ | ✓ | Allow | N/A |
| `/api/user/product` | ✗ | ✗ | ✓ | Allow | Check 403 |

### Authorization Checks (Defense in Depth)

```
MIDDLEWARE CHECK:
  if (!token) → 401 (not logged in)
  if (role !== "admin") → 403 (wrong role)
              ↓ (if passes)
CONTROLLER CHECK:
  if (!session) → 401 (session verification)
  if (session.user.role !== "admin") → 403 (double-check role)
              ↓ (if passes)
MODEL CHECK:
  Execute database query (may fail if data doesn't belong to user)
```

---

## 12. TECHNOLOGY STACK & PATTERN INTEGRATION

```
┌─────────────────────────────────────────────────────────────┐
│                     TECH STACK                              │
├─────────────────────────────────────────────────────────────┤
│ VIEW LAYER:                                                 │
│ • React 19.2.3 (UI components)                             │
│ • Next.js 16.1.3 (pages, SSR)                              │
│ • Tailwind CSS 4 (styling)                                 │
│                                                              │
│ CONTROLLER LAYER:                                            │
│ • Next.js API Routes (pages/api/)                          │
│ • NextAuth 4.24.13 (authentication)                        │
│ • Business logic (validation, authorization)                │
│                                                              │
│ MODEL LAYER:                                                │
│ • Prisma 6.19.2 (ORM)                                       │
│ • PostgreSQL (database)                                     │
│ • @next-auth/prisma-adapter (integration)                  │
│                                                              │
│ UTILITIES:                                                  │
│ • bcryptjs 3.0.3 (password hashing)                        │
│ • crypto-js 4.2.0 (encryption)                             │
│ • React Context API (state management)                      │
│ • NextAuth JWT (session management)                        │
└─────────────────────────────────────────────────────────────┘
```

### MVC Pattern Manifestation in Next.js

```
┌─────────────────────────────────────────────────────────────┐
│ MODEL (M)                                                   │
│ Prisma Schema → Database Schema → Data Models              │
│ Responsibility: Define structure, relationships, constraints│
│ Example: User, Product, Cart, CartItem models             │
├─────────────────────────────────────────────────────────────┤
│ CONTROLLER (C)                                              │
│ pages/api/ → Request handlers → Response senders           │
│ Responsibility: Validate, authorize, execute logic, query  │
│ Example: POST /api/cart → validate → query Model → return │
├─────────────────────────────────────────────────────────────┤
│ VIEW (V)                                                    │
│ pages/ → React components → UI rendering                   │
│ Responsibility: Display data, capture input, handle events │
│ Example: ProductTable → fetch from API → map to JSX       │
├─────────────────────────────────────────────────────────────┤
│ PLUS:                                                       │
│ Middleware: Authorization layer before Controllers        │
│ Context: State sharing across Views                        │
│ Utilities: Shared business logic (hash, prisma client)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. KEY TAKEAWAYS

### MVC Pattern Implementation in This Project

1. **MODEL LAYER** (`prisma/`)
   - Defines database schema with Prisma
   - Manages data relationships (User, Product, Cart, CartItem)
   - Enforces constraints and validations
   - Single source of truth for data structure

2. **CONTROLLER LAYER** (`pages/api/`)
   - Handles HTTP requests and responses
   - Validates user input and authentication
   - Executes business logic
   - Queries Model via Prisma client
   - Returns formatted responses (JSON)

3. **VIEW LAYER** (`pages/` + `components/`)
   - React components display data from Controllers
   - Captures user interactions (form submissions, button clicks)
   - Sends requests to Controllers via fetch/API calls
   - Updates UI based on Controller responses

4. **MIDDLEWARE** (`middleware.js`)
   - Request interceptor and authorization layer
   - Validates JWT tokens before requests reach pages/controllers
   - Enforces role-based access control
   - First line of defense for security

5. **STATE MANAGEMENT** (`lib/cartContext.js`)
   - React Context for sharing cart data across Views
   - Bridges Controller responses to multiple UI components
   - Avoids prop drilling

6. **UTILITIES** (`lib/hash.js`, `lib/prisma.js`)
   - Shared business logic and resources
   - Imported and used by Controllers
   - Promotes code reusability

### Data Flow Pattern

```
USER ACTION (View) → CONTROLLER (Validate & Query) → 
MODEL (Read/Write Database) → CONTROLLER (Format Response) → 
VIEW (Display/Update UI)
```

### Security Pattern

```
Middleware Validation → Controller Session Check → 
Controller Authorization Check → Model Query → Response
```

This architecture ensures:
- **Separation of Concerns**: Each layer has a single responsibility
- **Reusability**: Utilities and contexts shared across components
- **Testability**: Each layer can be tested independently
- **Security**: Multiple authentication/authorization layers
- **Scalability**: Clear structure allows easy feature addition

---

## 14. QUICK REFERENCE: FILES BY PURPOSE

### Authentication
- [pages/api/auth/[...nextauth].js](pages/api/auth/[...nextauth].js) - Main auth controller
- [pages/login.js](pages/login.js) - Login UI
- [pages/register.js](pages/register.js) - Registration UI
- [lib/hash.js](lib/hash.js) - Password utilities

### Cart Management
- [pages/api/cart/index.js](pages/api/cart/index.js) - Cart controller
- [lib/cartContext.js](lib/cartContext.js) - Cart state management
- [components/Navbar.js](components/Navbar.js) - Cart display

### Products
- [pages/api/products/[id].js](pages/api/products/[id].js) - Product controller
- [pages/products/index.js](pages/products/index.js) - Product listing (admin)
- [pages/dashboard/user.js](pages/dashboard/user.js) - Product catalog (user)

### Authorization
- [middleware.js](middleware.js) - Request pipeline authorization
- [pages/api/auth/[...nextauth].js](pages/api/auth/[...nextauth].js) - JWT creation

### Data Access
- [prisma/schema.prisma](prisma/schema.prisma) - Data models
- [lib/prisma.js](lib/prisma.js) - Prisma client

### Layout & Navigation
- [pages/dashboard/components/AdminLayout.js](pages/dashboard/components/AdminLayout.js) - Admin layout
- [pages/dashboard/components/UserLayout.js](pages/dashboard/components/UserLayout.js) - User layout
- [components/AdminNavbar.js](components/AdminNavbar.js) - Admin navigation

---

This analysis provides a complete understanding of how your Next.js e-commerce application implements the MVC architectural pattern with modern web technologies and security practices.
