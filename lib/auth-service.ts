import { persistentForumDataStore } from "./persistent-data-store"
import * as crypto from "crypto"

// Simple hash function for passwords
function simpleHash(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex")
}

// Simple token generation
function generateToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    iat: Date.now(),
  }

  // Simple base64 encoding (in production, use proper JWT)
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export const authService = {
  async loginUser({ username, password }: { username: string; password: string }) {
    try {
      console.log("🔐 Auth Service: Attempting login for", username)

      // Ensure data store is initialized
      const isInit = await persistentForumDataStore.isInitialized()
      if (!isInit) {
        console.log("🔄 Initializing data store for auth...")
        await persistentForumDataStore.initialize()
      }

      // Find user by username
      const user = await persistentForumDataStore.getUserByUsername(username)

      if (!user) {
        console.log("❌ Auth Service: User not found:", username)
        return {
          success: false,
          message: "Invalid username or password",
          user: null,
          token: null,
        }
      }

      // Check password - add debugging
      const hashedPassword = simpleHash(password)
      console.log("🔐 Auth Service: Comparing passwords for", username)
      console.log("🔐 Stored password length:", user.password?.length)
      console.log("🔐 Hashed input length:", hashedPassword?.length)

      if (user.password !== hashedPassword) {
        console.log("❌ Auth Service: Password mismatch for:", username)
        // Add more detailed debugging
        console.log("🔐 Expected hash starts with:", user.password?.substring(0, 10))
        console.log("🔐 Provided hash starts with:", hashedPassword?.substring(0, 10))
        return {
          success: false,
          message: "Invalid username or password",
          user: null,
          token: null,
        }
      }

      // Check if user is active
      if (!user.isActive) {
        console.log("❌ Auth Service: User is inactive:", username)
        return {
          success: false,
          message: "Account is inactive",
          user: null,
          token: null,
        }
      }

      // Update last active
      await persistentForumDataStore.updateUser(user.id, {
        lastActive: new Date().toISOString(),
      })

      // Generate token
      const token = generateToken(user)

      // Return user without password
      const { password: _, ...userWithoutPassword } = user

      console.log("✅ Auth Service: Login successful for", username)
      return {
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
        token,
      }
    } catch (error) {
      console.error("❌ Auth Service: Login error:", error)
      return {
        success: false,
        message: "Login failed due to server error",
        user: null,
        token: null,
      }
    }
  },

  async registerUser({
    username,
    email,
    password,
    name,
  }: { username: string; email: string; password: string; name: string }) {
    try {
      console.log("📝 Auth Service: Attempting registration for", username)

      // Ensure data store is initialized
      const isInit = await persistentForumDataStore.isInitialized()
      if (!isInit) {
        console.log("🔄 Initializing data store for auth...")
        await persistentForumDataStore.initialize()
      }

      // Check if username already exists
      const existingUser = await persistentForumDataStore.getUserByUsername(username)
      if (existingUser) {
        return {
          success: false,
          message: "Username already exists",
          user: null,
        }
      }

      // Check if email already exists
      const existingEmail = await persistentForumDataStore.getUserByEmail(email)
      if (existingEmail) {
        return {
          success: false,
          message: "Email already exists",
          user: null,
        }
      }

      // Hash password - ensure consistency
      const hashedPassword = simpleHash(password)
      console.log("🔐 Auth Service: Hashed password for registration:", hashedPassword?.substring(0, 10))

      // Create user
      const user = await persistentForumDataStore.addUser({
        username,
        email,
        password: hashedPassword,
        name,
        role: "user",
        isActive: true,
        lastActive: new Date().toISOString(),
      })

      // Return user without password
      const { password: _, ...userWithoutPassword } = user

      console.log("✅ Auth Service: Registration successful for", username)
      return {
        success: true,
        message: "Registration successful",
        user: userWithoutPassword,
      }
    } catch (error) {
      console.error("❌ Auth Service: Registration error:", error)
      return {
        success: false,
        message: "Registration failed due to server error",
        user: null,
      }
    }
  },
}
