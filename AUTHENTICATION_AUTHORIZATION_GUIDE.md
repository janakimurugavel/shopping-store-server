# Shopping Store: Authentication and Authorization Learning Guide

## Goal

Before adding MongoDB, improve the current project using in-memory arrays.

By the end of this guide, the API should support:

- Correct product data imports
- Consistent HTTP status codes and validation
- Customer registration
- Login with hashed passwords
- JWT authentication
- Customer and admin roles
- Admin-only product management
- A separate cart for every authenticated customer

Do not add MongoDB yet. It is okay for all data to disappear when the server restarts.

---

## Concepts to understand first

### Authentication

Authentication answers:

> Who is making this request?

For this project, a user authenticates by logging in with an email and password. After a successful login, the server gives the user a JWT.

### Authorization

Authorization answers:

> Is this user allowed to perform this action?

Examples:

- A customer can manage their own cart.
- An admin can create, update, and delete products.
- A customer must not be allowed to delete products.

### Expected request flow

```text
Client request
    |
    v
Route
    |
    v
Authentication middleware
    |
    v
Authorization middleware (when required)
    |
    v
Validation middleware
    |
    v
Controller
    |
    v
In-memory data
```

---

# Part 1: Fix the existing imports

## Why?

`db/product.js` exports an object containing two arrays:

```js
module.exports = { products, categories };
```

Therefore, this import does not return the products array:

```js
const products = require("../db/product");
```

It returns:

```js
{
    products: [...],
    categories: [...]
}
```

Calling `products.find()`, `products.filter()`, or `products.push()` on that object will fail.

## Tasks

1. Open `controller/productController.js`.
2. Change the product import to use object destructuring:

```js
const { products } = require("../db/product");
```

3. Make the same change in `middleware/productMiddleware.js`.
4. Open `controller/authController.js`.
5. Import `jsonwebtoken` before using `jwt.sign()`:

```js
const jwt = require("jsonwebtoken");
```

## Checkpoint

- `GET /products` returns the products array.
- `GET /products/:id` does not throw an error.
- The server does not report that `find`, `filter`, or `push` is not a function.

---

# Part 2: Improve validation and HTTP status codes

## Why?

The JSON response explains what happened to a person. The HTTP status code explains what happened to a client application.

A frontend may use the status to decide what to do:

```js
if (response.status === 401) {
    // Redirect the user to the login page
}

if (response.status === 404) {
    // Show a "product not found" message
}
```

## Status codes to use

| Status | Meaning | Example |
| --- | --- | --- |
| `200 OK` | A read, update, delete, or login succeeded | Product returned |
| `201 Created` | A new resource was created | User registered |
| `400 Bad Request` | Request input is missing or invalid | Negative price |
| `401 Unauthorized` | The user is not authenticated | Missing token |
| `403 Forbidden` | The user is authenticated but not permitted | Customer deletes product |
| `404 Not Found` | The requested resource does not exist | Unknown product ID |
| `409 Conflict` | The request conflicts with existing data | Duplicate email |
| `500 Internal Server Error` | An unexpected server error occurred | Unhandled exception |

## Tasks

### 2.1 Validate route IDs

Convert an ID to a number and make sure it is a positive integer:

```js
const id = Number(req.params.id);

if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
        success: false,
        message: "Product ID must be a positive integer"
    });
}
```

### 2.2 Return 404 for missing resources

```js
const product = products.find((item) => item.id === id);

if (!product) {
    return res.status(404).json({
        success: false,
        message: "Product not found"
    });
}
```

Always use `return` after sending an error response. Otherwise, the function may continue and try to send another response.

### 2.3 Return 201 after creation

Use `201` when creating a product, category, user, or new cart item:

```js
return res.status(201).json({
    success: true,
    data: newProduct,
    message: "Product created"
});
```

### 2.4 Validate product input

Product creation must verify:

- `name` exists and is a non-empty string.
- `price` is a number and is not negative.
- `stock` is an integer and is not negative.
- `category` exists and is a non-empty string.
- The product name is not already used.

Product update must validate only the supplied fields. For example, an update containing only `price` must not call `toLowerCase()` on a missing `name`.

Example:

```js
if (
    req.body.name !== undefined &&
    (
        typeof req.body.name !== "string" ||
        !req.body.name.trim()
    )
) {
    return res.status(400).json({
        success: false,
        message: "Name must be a non-empty string"
    });
}
```

When checking for a duplicate name during an update, exclude the product currently being updated.

### 2.5 Generate IDs safely

Avoid:

```js
id: products.length + 1
```

If a product is deleted, `length + 1` can reuse an existing ID.

Use:

```js
const nextId =
    products.length === 0
        ? 1
        : Math.max(...products.map((product) => product.id)) + 1;
```

## Checkpoint

Test at least:

- An invalid product ID returns `400`.
- A valid but unknown product ID returns `404`.
- Creating a valid product returns `201`.
- A negative price returns `400`.
- A negative or decimal stock value returns `400`.
- Updating only the price works.
- Updating an unknown product returns `404`.

---

# Part 3: Add an in-memory user store and roles

## Why?

The application needs to know:

- Who can log in
- Which password hash belongs to each user
- Whether the user is a customer or admin
- Which user owns a cart item

## Task

Create `db/user.js`:

```js
const users = [];

module.exports = { users };
```

A user will have this structure:

```js
{
    id: 1,
    name: "Jane",
    email: "jane@example.com",
    passwordHash: "$2b$10$...",
    role: "customer"
}
```

Valid roles for this exercise are:

```text
customer
admin
```

## Important security rules

Never store a plain password:

```js
// Do not do this
password: "secret123"
```

Never include `passwordHash` in an API response.

Public registration must not accept a role from the request:

```js
// Do not do this
role: req.body.role
```

Otherwise, anyone could send `"role": "admin"` and create an admin account.

Every publicly registered user must receive:

```js
role: "customer"
```

For this in-memory exercise, create the first admin as development seed data with an already-hashed password. Do not hard-code a plain admin password in the repository.

## Checkpoint

- The project has one shared `users` array.
- User objects have `id`, `name`, `email`, `passwordHash`, and `role`.
- Registration cannot choose the `admin` role.

---

# Part 4: Implement registration with bcrypt

## Why?

Passwords must not be stored as plain text. If stored passwords are exposed, every password would immediately be readable.

Hashing changes a password into a one-way value:

```text
password -> bcrypt hash
```

During login, bcrypt checks whether a supplied password matches the stored hash. The application does not decrypt the hash.

Use bcrypt's asynchronous API so password hashing does not block Node.js from processing other requests.

## Install bcrypt

```powershell
npm install bcrypt
```

## Route

Add this endpoint to `routes/authRoutes.js`:

```js
router.post("/register", register);
```

Import `register` from the authentication controller.

## Registration algorithm

Implement `register` in `controller/authController.js`.

The controller must:

1. Read `name`, `email`, and `password`.
2. Trim `name` and `email`.
3. Convert email to lowercase.
4. Return `400` if any required field is missing.
5. Require a reasonable password length, such as 8 characters.
6. Return `409` if the email is already registered.
7. Hash the password with bcrypt.
8. Create a user with the role `customer`.
9. Store the user in the `users` array.
10. Return `201` without returning the password hash.

Starter structure:

```js
const bcrypt = require("bcrypt");
const { users } = require("../db/user");

const register = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        // Validate the input
        // Check for an existing email

        const passwordHash = await bcrypt.hash(password, 10);

        // Generate an ID
        // Create and store the customer

        return res.status(201).json({
            success: true,
            data: {
                // Return safe user fields only
            },
            message: "User registered"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
```

Do not copy the password into the user object. Store only `passwordHash`.

## Checkpoint

Send:

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Jane",
  "email": "Jane@Example.com",
  "password": "secret123"
}
```

Confirm:

- The response is `201`.
- The stored email is lowercase.
- The stored password is a bcrypt hash.
- The response does not contain the password or hash.
- Registering the same email again returns `409`.
- Supplying `"role": "admin"` still creates a customer.

---

# Part 5: Implement login and issue a JWT

## Why?

Registration creates an account. Login verifies that someone knows the password belonging to that account.

After a successful login, the server creates a signed JWT:

```text
Email and password
        |
        v
Find the user
        |
        v
Compare password with passwordHash
        |
        v
Create and return a JWT
```

The client sends that token with later requests.

## Environment variable

Add a strong development secret to the local `.env` file:

```env
JWT_SECRET=replace-this-with-a-long-random-development-secret
```

Make sure `.env` is listed in `.gitignore`. Do not commit the real secret.

Create an `.env.example` that can be committed:

```env
PORT=3000
JWT_SECRET=add-your-secret-here
```

## Route

Use:

```js
router.post("/login", login);
```

The old `/admin/login` endpoint should be replaced. Customers and admins use the same login endpoint; authorization later decides what each role may do.

## Login algorithm

The controller must:

1. Read and normalize the email.
2. Read the password.
3. Return `400` when either value is missing.
4. Find the user by email.
5. Use `await bcrypt.compare(password, user.passwordHash)`.
6. Return `401` if the account or password is incorrect.
7. Create a JWT containing the user's ID.
8. Give the JWT an expiration time.
9. Return the JWT and safe user information.

Starter structure:

```js
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        // Validate input
        // Find user
        // Compare password

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
```

Use the same message for an unknown email and a wrong password:

```text
Invalid email or password
```

This avoids revealing which email addresses are registered.

Keep the token payload small. `userId` is enough for this exercise.

## Checkpoint

- Correct credentials return `200` and a JWT.
- An unknown email returns `401`.
- A wrong password returns `401`.
- Missing input returns `400`.
- The token expires after 24 hours.

---

# Part 6: Separate authentication and authorization middleware

## Why?

Authentication and authorization are different responsibilities:

```text
authenticate
    |
    +-- Is the token present and valid?
    +-- Which user does it belong to?

authorize("admin")
    |
    +-- Does the authenticated user have the required role?
```

Separating them makes the middleware reusable.

## Create the middleware file

Create:

```text
middleware/authMiddleware.js
```

## Implement `authenticate`

The client will send:

```http
Authorization: Bearer <token>
```

The middleware must:

1. Read the `Authorization` header.
2. Confirm that it starts with `Bearer `.
3. Return `401` if no token is supplied.
4. Verify the token with `JWT_SECRET`.
5. Find the current user using the decoded `userId`.
6. Return `401` if the token is invalid, expired, or refers to a missing user.
7. Attach safe user information to `req.user`.
8. Call `next()`.

Starter structure:

```js
const jwt = require("jsonwebtoken");
const { users } = require("../db/user");

const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required"
        });
    }

    const token = authorization.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = users.find(
            (item) => item.id === decoded.userId
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
```

Looking up the current user is important. It uses the user's current role instead of trusting role information from an older token.

## Implement `authorize`

`authorize` should accept one or more allowed roles and return middleware:

```js
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission"
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
```

## Protect product management

Product reading can remain public:

```js
router.get("/", getAllProducts);
router.get("/:id", getProductById);
```

Product creation, updating, and deletion should require an admin:

```js
router.post(
    "/",
    authenticate,
    authorize("admin"),
    validateProduct,
    addProduct
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    validateUpdateProduct,
    updateProduct
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteProduct
);
```

Protect category creation, updating, and deletion in the same way.

Middleware order matters:

```text
authenticate -> authorize -> validate -> controller
```

## Checkpoint

- A request without a token returns `401`.
- An invalid token returns `401`.
- An expired token returns `401`.
- A customer token on an admin route returns `403`.
- An admin token can access an admin route.

---

# Part 7: Associate cart items with the authenticated user

## Why?

The current application has one shared cart. If two customers use it, both customers see and change the same data.

Every cart item needs an owner:

```js
{
    userId: 1,
    productId: 3,
    quantity: 2
}
```

The server must get `userId` from `req.user`, not from the request body.

Do not do this:

```js
const userId = req.body.userId;
```

A customer could send another customer's ID and modify that customer's cart.

Use:

```js
const userId = req.user.id;
```

## Create one cart data module

Create `db/cart.js`:

```js
const cartItems = [];

module.exports = { cartItems };
```

Remove duplicate cart arrays from the route and controller. Import the one shared array wherever it is needed:

```js
const { cartItems } = require("../db/cart");
```

## Protect every cart route

In `routes/cartRoutes.js`, add authentication before all cart endpoints:

```js
router.use(authenticate);

router.get("/", getCartItems);
router.post("/items", validateCart, addCartItem);
router.patch("/items/:productId", validateUpdateCart, updateCartItem);
router.delete("/items/:productId", validateDeleteCart, deleteCartItem);
```

Only routes declared after `router.use(authenticate)` are protected by it.

## Get only the current user's items

```js
const userCart = cartItems.filter(
    (item) => item.userId === req.user.id
);
```

Do not return every item in `cartItems`.

## Add an item safely

The client should send only:

```json
{
  "productId": 2,
  "quantity": 3
}
```

Do not trust a client-supplied product name or price. A malicious client could send a fake price.

The controller must:

1. Get `userId` from `req.user.id`.
2. Validate `productId` and `quantity`.
3. Find the real product in the products array.
4. Return `404` if the product does not exist.
5. Check that sufficient stock is available.
6. Search for an existing item using both `userId` and `productId`.
7. Increase its quantity if it exists.
8. Otherwise, create a new item with `userId`, `productId`, and `quantity`.

The important search is:

```js
const existingItem = cartItems.find(
    (item) =>
        item.userId === req.user.id &&
        item.productId === productId
);
```

## Update an item safely

Find the item using both values:

```js
const cartItem = cartItems.find(
    (item) =>
        item.userId === req.user.id &&
        item.productId === productId
);
```

This prevents one user from updating another user's item.

Also check:

- The item exists; otherwise return `404`.
- Quantity is a positive integer.
- The requested quantity does not exceed available stock.

## Delete an item safely

The deletion search must also use both values:

```js
const index = cartItems.findIndex(
    (item) =>
        item.userId === req.user.id &&
        item.productId === productId
);
```

## Optional response improvement

Store only:

```js
{
    userId,
    productId,
    quantity
}
```

When returning the cart, join each cart item with its product so the response can include the current product name and price. This avoids storing an old price in the cart.

## Checkpoint

Create two customers and confirm:

- Customer A sees only Customer A's cart.
- Customer B sees only Customer B's cart.
- Customer B cannot update or delete Customer A's items.
- A missing token returns `401`.
- A nonexistent product returns `404`.
- Insufficient stock returns `400`.
- A newly added cart item returns `201`.

---

# Part 8: Complete manual test plan

Use Postman, Insomnia, Thunder Client, or another API client.

## 8.1 Register a customer

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Jane",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Expected: `201 Created`.

## 8.2 Register the same email again

Expected: `409 Conflict`.

## 8.3 Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Expected: `200 OK` with a token.

Save the token.

## 8.4 Access the cart without a token

```http
GET /cart
```

Expected: `401 Unauthorized`.

## 8.5 Access the cart with a token

```http
GET /cart
Authorization: Bearer <customer-token>
```

Expected: `200 OK`.

## 8.6 Add a cart item

```http
POST /cart/items
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

Expected: `201 Created` for a new item.

## 8.7 Attempt an admin action as a customer

```http
POST /products
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "name": "Tea",
  "price": 250,
  "stock": 10,
  "category": "Grocery"
}
```

Expected: `403 Forbidden`.

## 8.8 Attempt an admin action without a token

Expected: `401 Unauthorized`.

## 8.9 Perform an admin action

Repeat the request with a valid admin token.

Expected: `201 Created`.

## 8.10 Test customer isolation

1. Register and login as Customer A.
2. Add a product to Customer A's cart.
3. Register and login as Customer B.
4. Request Customer B's cart.
5. Confirm that Customer A's item is not returned.

---

# Recommended final file structure

```text
shopping-store-server/
|-- app.js
|-- controller/
|   |-- authController.js
|   |-- cartController.js
|   |-- categoryController.js
|   `-- productController.js
|-- db/
|   |-- cart.js
|   |-- product.js
|   `-- user.js
|-- middleware/
|   |-- authMiddleware.js
|   |-- cartMiddleware.js
|   |-- categoryMiddleware.js
|   `-- productMiddleware.js
|-- routes/
|   |-- authRoutes.js
|   |-- cartRoutes.js
|   |-- categoryRoutes.js
|   `-- productRoutes.js
|-- .env
|-- .env.example
|-- .gitignore
|-- package.json
`-- AUTHENTICATION_AUTHORIZATION_GUIDE.md
```

---

# Definition of done

The assignment is complete when:

- [ ] Product imports work correctly.
- [ ] `jsonwebtoken` is imported wherever it is used.
- [ ] Invalid input returns `400`.
- [ ] Missing resources return `404`.
- [ ] Created resources return `201`.
- [ ] Duplicate registration returns `409`.
- [ ] Passwords are hashed with asynchronous bcrypt.
- [ ] Passwords and password hashes are never returned.
- [ ] Public registration always creates a customer.
- [ ] Login returns a JWT for correct credentials.
- [ ] Authentication middleware sets `req.user`.
- [ ] Missing or invalid tokens return `401`.
- [ ] Customers attempting admin operations receive `403`.
- [ ] Product and category write operations require an admin.
- [ ] Every cart operation requires authentication.
- [ ] Cart items use the authenticated user's ID.
- [ ] Users cannot see or modify another user's cart.
- [ ] Product price and name are obtained from server data.
- [ ] `.env` is ignored by Git.
- [ ] `.env.example` contains placeholders only.
- [ ] All manual test cases pass.

---

# Reflection questions

After finishing the implementation, answer these questions:

1. What is the difference between authentication and authorization?
2. Why should the API never store plain passwords?
3. Why should the API return the same login error for an unknown email and an incorrect password?
4. What is the difference between `401` and `403`?
5. Why should public registration not accept a role?
6. Why is `req.user.id` safer than `req.body.userId` for cart ownership?
7. Why should the cart not trust a price sent by the client?
8. Why must product update validation check only fields that were supplied?
9. Why can `array.length + 1` produce duplicate IDs after deletion?
10. When MongoDB is introduced, which array operations will be replaced by database operations?

---

# What comes after this?

After this guide is complete, MongoDB can replace the in-memory arrays.

For example:

```js
users.find(...)
users.push(...)
products.find(...)
cartItems.filter(...)
```

will become database queries.

The important ideas learned here will remain:

- Routes
- Controllers
- Validation
- Password hashing
- JWT authentication
- Role authorization
- User ownership
- HTTP status codes

That is why completing this stage before MongoDB makes the database lesson much easier.
