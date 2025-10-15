import http from "http";
import url from "url";
import { db } from "./db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { parse } from "cookie";
import { fileURLToPath } from "url";
import { dirname } from "path";
import busboy from "busboy";
import { TIMEOUT } from "dns";

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    cookies[name] = decodeURIComponent(rest.join("="));
  });
  return cookies;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const allowedOrigin = "http://localhost:5173";
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const parsedUrl = url.parse(req.url, true);
  if (req.method === "POST" && parsedUrl.pathname === "/api/deleteUsers") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const ids = JSON.parse(body).selectedUsersId;

      try {
        await db.query(
          `DELETE FROM users WHERE id IN (${ids.map(() => "?").join(",")})`,
          ids
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Users deleted" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while deleting users" }));
      }
    });
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/getUsers") {
    try {
      const [rows] = await db.query("SELECT * FROM users");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ users: rows }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/getPurchases") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const user_id = JSON.parse(body).user_id;
      try {
        const [rows] = await db.query(
          `SELECT * FROM purchases WHERE buyer_id=?`,
          [user_id]
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ purchases: rows }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/getConditions") {
    try {
      const [rows] = await db.query("SELECT * FROM listing_conditions");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ conditions: rows }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/getCategories") {
    try {
      const [rows] = await db.query("SELECT * FROM category");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ categories: rows }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/getSubcategories") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const category = JSON.parse(body).category;
      try {
        const [rows] = await db.query(
          "SELECT * FROM subcategory WHERE category=?",
          category
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ subcategories: rows }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/deleteListings") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const ids = JSON.parse(body).selectedCatIds;
      const id = JSON.parse(body).selectedListing;
      if (ids) {
        try {
          await db.query(
            `DELETE FROM listing WHERE id IN (${ids.map(() => "?").join(",")})`,
            ids
          );
          res.writeHead(201);
          res.end(JSON.stringify({ message: "Listings deleted" }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Error while deleting listings" }));
        }
      } else if (id) {
        try {
          await db.query(`DELETE FROM listing WHERE id=? `, id);
          res.writeHead(201);
          res.end(JSON.stringify({ message: "Listings deleted" }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Error while deleting listings" }));
        }
      }
    });
  }
  if (
    req.method === "POST" &&
    parsedUrl.pathname === "/api/deleteSubcategories"
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const ids = JSON.parse(body).selectedSubCatIds;
      try {
        await db.query(
          `DELETE FROM subcategory WHERE id IN (${ids
            .map(() => "?")
            .join(",")})`,
          ids
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Category added" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding category" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/deleteCategories") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const ids = JSON.parse(body).selectedCatIds;
      try {
        await db.query(
          `DELETE FROM category WHERE id IN (${ids.map(() => "?").join(",")})`,
          ids
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Category added" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding category" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/deleteConditions") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const ids = JSON.parse(body).selectedCondIds;
      try {
        await db.query(
          `DELETE FROM listing_conditions WHERE id IN (${ids
            .map(() => "?")
            .join(",")})`,
          ids
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Category added" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding category" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/deleteImages") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const picture_path = JSON.parse(body).imageIds;
      try {
        await db.query(
          `DELETE FROM pictures WHERE image_path IN (${picture_path
            .map(() => "?")
            .join(",")})`,
          picture_path
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Pictures deleted" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding category" }));
      }
    });
  }
  if (
    req.method === "POST" &&
    parsedUrl.pathname === "/api/removeFromShoppingCart"
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { id, listing_id } = JSON.parse(body);
      try {
        await db.query(
          `DELETE FROM shopping_cart WHERE id=? AND listing_id=?  `,
          [id, listing_id]
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Pictures deleted" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding category" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/addSubcategory") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { selectedCategory, subCategory } = JSON.parse(body);
      try {
        await db.query(
          "INSERT INTO subcategory (category,subcategory) VALUE (?,?) ",
          [selectedCategory, subCategory]
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Subcategory added" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding subcategory" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/addCategory") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { category } = JSON.parse(body);
      try {
        await db.query("INSERT INTO category (category) VALUE (?) ", [
          category,
        ]);
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Category added" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding category" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/addCondition") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { condition } = JSON.parse(body);
      try {
        await db.query(
          "INSERT INTO listing_conditions (condition_name) VALUE (?) ",
          [condition]
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Condition added" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while adding condition" }));
      }
    });
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/getAllListings") {
    try {
      const [rows] = await db.query(`SELECT listing.*, pictures.image_path
        FROM 
        listing
        LEFT JOIN
        pictures
        ON
        listing.id=pictures.listing_id 
        `);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ listing: rows }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/categoryListing") {
    const query = new URLSearchParams(parsedUrl.query);
    const category = query.get("category");
    const subcategory = query.get("subcategory");
    let sql = `SELECT listing.*, pictures.image_path
        FROM 
        listing
        LEFT JOIN
        pictures
        ON
        listing.id=pictures.listing_id 
        WHERE
        listing.category=? 
        `;
    const params = [category];
    if (subcategory) {
      sql += `AND listing.subcategory=?`;
      params.push(subcategory);
    }
    try {
      const [rows] = await db.query(sql, params);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(rows));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/getListing") {
    const query = new URLSearchParams(parsedUrl.query);
    const listingId = query.get("id");

    if (!listingId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing listing ID" }));
      return;
    }
    try {
      const [rows] = await db.query(
        `SELECT listing.*, pictures.image_path
        FROM 
        listing
        LEFT JOIN
        pictures
        ON
        listing.id=pictures.listing_id 
        WHERE
        listing.id=?
        `,
        [listingId]
      );
      if (rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Listing not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(rows));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/getUserInfo") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const user_id = body;
      try {
        const [user] = await db.query(
          "SELECT id, username, name, address, phone_number, email_address, rating FROM users WHERE id=?",
          [user_id]
        );
        res.writeHead(200, { "Content-type": "application/json" });
        res.end(JSON.stringify({ user: user }));
      } catch (err) {
        res.writeHead(500, { "Content-type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/purchase") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { seller_id, buyer_id, listing_id } = JSON.parse(body);
      for (let i = 0; i < seller_id.length; i++) {
        try {
          await db.query(
            `INSERT INTO purchases (seller_id, buyer_id, listing_id)
       VALUES (?, ?, ?)`,
            [seller_id[i], buyer_id[i], listing_id[i]]
          );
          await db.query(
            `UPDATE listing
       SET is_sold = 1
       WHERE id = ?`,
            [listing_id[i]]
          );
        } catch (err) {
          console.error("Error processing transaction:", err);
          res.writeHead(500, { "Content-type": "application/json" });
          res.end(JSON.stringify({ error: "Database error" }));
          return;
        }
      }
      res.writeHead(200);
      res.end();
    });
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/getUser") {
    const query = new URLSearchParams(parsedUrl.query);
    const userId = query.get("id");

    if (!userId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing user ID" }));
      return;
    }
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id=?", [userId]);
      if (rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Listing not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(rows));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }

  if (
    req.method === "POST" &&
    parsedUrl.pathname === "/api/getAllListingsFromUser"
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const user_id = body;
      try {
        const [listings] = await db.query(
          `SELECT listing.*, pictures.image_path
        FROM 
        listing
        LEFT JOIN
        pictures
        ON
        listing.id=pictures.listing_id 
        WHERE
        listing.user_id=?
        `,
          [user_id]
        );
        res.writeHead(200, { "Content-type": "application/json" });
        res.end(JSON.stringify({ listing: listings }));
      } catch (err) {
        res.writeHead(500, { "Content-type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/createListing") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const {
        title,
        listing_body,
        user_id,
        selectedCategory,
        selectedSubcategory,
        filePath,
        price,
        selectedCondition,
      } = JSON.parse(body);
      try {
        const [result] = await db.query(
          "INSERT INTO listing (title,body,user_id,created_at,category,subcategory,price,condition_name) VALUES (?,?,?,NOW(),?,?,?,?)",
          [
            title,
            listing_body,
            user_id,
            selectedCategory,
            selectedSubcategory,
            price,
            selectedCondition,
          ]
        );
        let id = result.insertId;
        if (filePath.length === 1) {
          await db.query(
            "INSERT INTO pictures (listing_id,image_path) VALUES (?,?)",
            [id, filePath]
          );
        } else if (filePath.length > 1) {
          for (const path of filePath) {
            await db.query(
              "INSERT INTO pictures (listing_id,image_path) VALUES (?,?)",
              [id, path]
            );
          }
        }
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Listing created" }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while creating listing" }));
      }
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/updateListing") {
    let body = "";

    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const {
        listing_id,
        title,
        listing_body,
        user_id,
        selectedCategory,
        selectedSubcategory,
        filePath,
        price,
        selectedCondition,
      } = JSON.parse(body);

      try {
        const [result] = await db.query(
          "UPDATE listing SET title=?, body=?, user_id=?, category=?, subcategory=?, price=?, condition_name=? WHERE id=?",
          [
            title,
            listing_body,
            user_id,
            selectedCategory,
            selectedSubcategory,
            price,
            selectedCondition,
            listing_id,
          ]
        );
        if (!filePath) {
          return;
        }

        if (filePath.length === 1) {
          await db.query(
            "INSERT INTO pictures (listing_id,image_path) VALUES (?,?)",
            [listing_id, filePath]
          );
        } else if (filePath.length > 1) {
          for (const path of filePath) {
            await db.query(
              "INSERT INTO pictures (listing_id,image_path) VALUES (?,?)",
              [listing_id, path]
            );
          }
        }
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Listing created" }));
      } catch (err) {
        console.log(err);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error while creating listing" }));
      }
    });
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/upload") {
    const bb = busboy({ headers: req.headers });
    let savePath = "";
    bb.on("file", (name, file, info) => {
      const { filename } = info;
      const uniqueName = Date.now() + "-" + filename;
      savePath = path.join(uploadDir, uniqueName);
      file.pipe(fs.createWriteStream(savePath));
    });
    bb.on("finish", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "File uploaded",
          body: savePath,
        })
      );
    });
    req.pipe(bb);
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/getImage") {
    const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const imagePath = query.get("name");

    if (!fs.existsSync(imagePath)) {
      res.writeHead(404);
      return res.end("Image not found");
    }

    const readStream = fs.createReadStream(imagePath);
    readStream.pipe(res);
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/adminRegister") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { username, password } = JSON.parse(body);
      const hash = await bcrypt.hash(password, 10);
      try {
        await db.query(
          "INSERT INTO admin (username,password_hash) VALUES (?,?)",
          [username, hash]
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Admin created" }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Username taken" }));
      }
    });
    return;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/changePassword") {
    let body = "";

    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { oldPassword, newPassword, user_id } = JSON.parse(body);
      const newHash = await bcrypt.hash(newPassword, 10);
      try {
        const [rows] = await db.query("SELECT * FROM users WHERE id=?", [
          user_id,
        ]);
        if (!rows[0]) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: "Invalid username" }));
          return;
        }
        const user = rows[0];
        const match = await bcrypt.compare(oldPassword, user.password_hash);
        if (!match) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: "Invalid password" }));
          return;
        }

        await db.query("UPDATE users SET password_hash=? WHERE id=?", [
          newHash,
          user_id,
        ]);
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Password changed" }));
      } catch (err) {}
    });
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/register") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { username, password } = JSON.parse(body);
      const hash = await bcrypt.hash(password, 10);
      try {
        await db.query(
          "INSERT INTO users (username,password_hash) VALUES (?,?)",
          [username, hash]
        );
        res.writeHead(201);
        res.end(JSON.stringify({ message: "User registered" }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Username taken" }));
      }
    });
    return;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/adminLogin") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { username, password } = JSON.parse(body);
      const [rows] = await db.query("SELECT * FROM admin WHERE username=?", [
        username,
      ]);
      if (!rows[0]) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: "Invalid username" }));
        return;
      }
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: "Invalid password" }));
        return;
      }
      const sessionId = uuidv4();
      await db.query(
        "INSERT INTO admin_session (session_id,user_id) VALUES (?,?)",
        [sessionId, user.id]
      );
      res.setHeader(
        "Set-Cookie",
        `sessionId=${sessionId}; Path=/; HttpOnly; Max-Age=43200`
      );
      res.writeHead(200);
      res.end(JSON.stringify({ message: "Logged in" }));
    });
    return;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/login") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { username, password } = JSON.parse(body);
      const [rows] = await db.query("SELECT * FROM users WHERE username=?", [
        username,
      ]);
      if (!rows[0]) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: "Invalid username" }));
        return;
      }
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: "Invalid password" }));
        return;
      }
      const sessionId = uuidv4();
      await db.query(
        "INSERT INTO sessions (session_id,user_id,created_at) VALUES (?,?,NOW()) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id), created_at = NOW()",
        [sessionId, user.id]
      );
      res.setHeader(
        "Set-Cookie",
        `sessionId=${sessionId}; Path=/; HttpOnly; Max-Age=43200`
      );
      res.writeHead(200);
      res.end(JSON.stringify({ message: "Logged in" }));
    });
    return;
  }
  if (req.method === "PUT" && parsedUrl.pathname === "/api/adminUpdate") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const {
        adminUsername,
        adminPassword,
        username,
        name,
        address,
        phone_number,
        email_address,
        IBAN,
      } = JSON.parse(body);
      const [rows] = await db.query("SELECT * FROM admin WHERE username=?", [
        adminUsername,
      ]);
      const user = rows[0];
      const match = await bcrypt.compare(adminPassword, user.password_hash);
      if (!match) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: "Invalid password" }));
        return;
      }
      await db.query(
        "UPDATE users SET username=?, name=?, address=?, phone_number=?, email_address=?, iban=? WHERE username=?",
        [username, name, address, phone_number, email_address, IBAN, username]
      );
      res.writeHead(201);
      res.end(JSON.stringify({ message: "Updated" }));
    });
    return;
  }
  if (req.method === "PUT" && parsedUrl.pathname === "/api/update") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const {
        username,
        password,
        name,
        address,
        phone_number,
        email_address,
        IBAN,
      } = JSON.parse(body);
      const [rows] = await db.query("SELECT * FROM users WHERE username=?", [
        username,
      ]);
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: "Invalid password" }));
        return;
      }
      await db.query(
        "UPDATE users SET username=?, name=?, address=?, phone_number=?, email_address=?, iban=? WHERE username=?",
        [username, name, address, phone_number, email_address, IBAN, username]
      );
      res.writeHead(201);
      res.end(JSON.stringify({ message: "Updated" }));
    });
    return;
  }
  if (
    req.method === "POST" &&
    parsedUrl.pathname === "/api/addToShoppingCart"
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { listing_id, user_id } = JSON.parse(body);
      const [rows] = await db.query(
        "INSERT INTO shopping_cart (listing_id,user_id) VALUES (?,?)",
        [listing_id, user_id]
      );

      res.writeHead(201);
      res.end(JSON.stringify({}));
    });
    return;
  }
  if (req.method === "POST" && parsedUrl.pathname === "/api/getShoppingCart") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const user_id = body;
      const [rows] = await db.query(
        `SELECT 
    shopping_cart.*, 
    listing.title,
    listing.price,
    pictures.image_path
FROM 
    shopping_cart
JOIN 
    listing
    ON shopping_cart.listing_id = listing.id
LEFT JOIN
    pictures
    ON pictures.id = (
        SELECT MIN(id) 
        FROM pictures 
        WHERE listing_id = listing.id
    )
WHERE
    shopping_cart.user_id = ?
    AND listing.is_sold = 0;`,
        [user_id]
      );
      res.writeHead(201);
      res.end(JSON.stringify({ shoppingCart: rows }));
    });
    return;
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/me") {
    const cookies = parseCookies(req.headers.cookie || "");
    const sessionId = cookies.sessionId;
    if (!sessionId) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: "Not logged in" }));
      return;
    }

    try {
      const [rows] = await db.query(
        "SELECT user_id FROM sessions WHERE session_id = ?",
        [sessionId]
      );
      if (rows.length === 0) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid session" }));
      }
      const user = rows[0];
      const [data] = await db.query("SELECT * FROM users WHERE id = ?", [
        user.user_id,
      ]);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          data: data[0],
          loggedIn: true,
        })
      );
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
    return;
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/admin") {
    const cookies = parseCookies(req.headers.cookie || "");
    const sessionId = cookies.sessionId;

    if (!sessionId) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: "Not logged in" }));
      return;
    }

    try {
      const [rows] = await db.query(
        "SELECT user_id FROM admin_session WHERE session_id = ?",
        [sessionId]
      );
      if (rows.length === 0) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid session" }));
      }
      const user = rows[0];
      const [data] = await db.query("SELECT * FROM admin WHERE id = ?", [
        user.user_id,
      ]);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          data: data[0],
          loggedIn: true,
        })
      );
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/logout") {
    const cookies = parseCookies(req.headers.cookie || "");
    const sessionIdL = cookies.sessionId;
    if (!sessionIdL) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: "Not logged in" }));
      return;
    }
    try {
      const [rows] = await db.query("DELETE FROM sessions WHERE session_id=?", [
        sessionIdL,
      ]);
      if (rows.length === undefined) {
        const [rows] = await db.query(
          "DELETE FROM admin_session WHERE session_id=?",
          [sessionIdL]
        );
        if (rows.length === undefined) {
          res.writeHead(401, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid session" }));
        }
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end();
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }

    return;
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
