import { persistentForumDataStore } from "@/lib/persistent-data-store"

export interface UserRegistrationData {
  username: string
  password: string
  name: string
}

export interface UserLoginData {
  username: string
  password: string
}

export interface AuthResult {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    name: string
    username: string
  }
}

// Simple hash function for passwords (in production, use proper hashing)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Simple token generation
function generateToken(userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  return `${userId}_${timestamp}_${random}`
}

export class AuthService {
  // Register a new user
  async registerUser(userData: UserRegistrationData): Promise<AuthResult> {
    try {
      console.log(`🔐 AuthService: Registering user ${userData.username}`)

      // Check if username already exists
      let existingUsername
      try {
        existingUsername = await persistentForumDataStore.getUserByUsername(userData.username)
        console.log(`🔐 AuthService: Username check completed for ${userData.username}`)
      } catch (checkError) {
        console.error("❌ AuthService: Error checking existing username:", checkError)
        return {
          success: false,
          message: `Username check failed: ${checkError instanceof Error ? checkError.message : String(checkError)}`,
        }
      }

      if (existingUsername) {
        console.log(`❌ AuthService: Username ${userData.username} already exists`)
        return {
          success: false,
          message: "Username is already taken",
        }
      }

      // Hash the password
      let hashedPassword
      try {
        hashedPassword = simpleHash(userData.password)
        console.log("🔐 AuthService: Password hashed successfully")
      } catch (hashError) {
        console.error("❌ AuthService: Error hashing password:", hashError)
        return {
          success: false,
          message: "Password processing failed",
        }
      }

      // Create the user
      console.log(`🔐 AuthService: Creating new user ${userData.username}`)
      let newUser
      try {
        newUser = await persistentForumDataStore.addUser({
          username: userData.username,
          name: userData.name,
          email: `${userData.username}@example.com`, // Generate email from username
          password: hashedPassword,
          role: "user",
        })
        console.log("🔐 AuthService: User creation call completed")
      } catch (createError) {
        console.error("❌ AuthService: Error creating user:", createError)
        return {
          success: false,
          message: `User creation failed: ${createError instanceof Error ? createError.message : String(createError)}`,
        }
      }

      if (!newUser || !newUser.id) {
        console.error("❌ AuthService: Failed to create user - invalid user object returned:", newUser)
        return {
          success: false,
          message: "Failed to create user account. Please try again.",
        }
      }

      console.log(`✅ AuthService: User ${userData.username} created with ID ${newUser.id}`)

      // Generate token
      let token
      try {
        token = generateToken(newUser.id)
        console.log("🔐 AuthService: Token generated successfully")
      } catch (tokenError) {
        console.error("❌ AuthService: Error generating token:", tokenError)
        return {
          success: false,
          message: "Token generation failed",
        }
      }

      return {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
        },
      }
    } catch (error) {
      console.error("❌ AuthService: Registration error:", error)
      return {
        success: false,
        message: `Registration failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  // Login user
  async loginUser(loginData: UserLoginData): Promise<AuthResult> {
    try {
      console.log(`🔐 AuthService: Login attempt for ${loginData.username}`)

      // First, let's check if any users exist at all
      try {
        // Changed from getAllUsers to getUsers which is the correct method
        const allUsers = await persistentForumDataStore.getUsers()
        console.log(`🔐 AuthService: Total users in system: ${allUsers.length}`)

        if (allUsers.length === 0) {
          console.log("⚠️ AuthService: No users found in system. System may need initialization.")
          return {
            success: false,
            message: "System not initialized. Please use the 'Reinitialize System' button.",
          }
        }

        // Log all usernames for debugging
        console.log(
          "🔐 AuthService: Available usernames:",
          allUsers.map((u) => u.username),
        )
      } catch (error) {
        console.error("❌ AuthService: Error checking user count:", error)
      }

      // Find user by username using persistent store
      let user
      try {
        user = await persistentForumDataStore.getUserByUsername(loginData.username)
        console.log(`🔐 AuthService: User lookup result for ${loginData.username}:`, user ? "Found" : "Not found")
      } catch (error) {
        console.error(`❌ AuthService: Error looking up user ${loginData.username}:`, error)
        return {
          success: false,
          message: "Database error during login. Please try again.",
        }
      }

      if (!user) {
        console.log(`❌ AuthService: User ${loginData.username} not found`)
        return {
          success: false,
          message: "Invalid username or password. Try: ctm_admin, tech_expert, builder_pro, or testuser",
        }
      }

      // Compare passwords
      const hashedPassword = simpleHash(loginData.password)
      console.log(`🔐 AuthService: Password comparison for ${loginData.username}`)
      console.log(`🔐 AuthService: Input password: "${loginData.password}"`)
      console.log(`🔐 AuthService: Input password hash: ${hashedPassword}`)
      console.log(`🔐 AuthService: Stored password hash: ${user.password}`)
      console.log(`🔐 AuthService: Passwords match: ${hashedPassword === user.password}`)

      if (hashedPassword !== user.password) {
        console.log(`❌ AuthService: Invalid password for ${loginData.username}`)
        return {
          success: false,
          message: "Invalid username or password. Check the default credentials in the debug section.",
        }
      }

      // Update last active timestamp
      try {
        await persistentForumDataStore.updateUser(user.id, {
          lastActive: new Date().toISOString(),
        })
        console.log(`✅ AuthService: User ${loginData.username} logged in successfully`)
      } catch (updateError) {
        console.warn("⚠️ AuthService: Failed to update user activity:", updateError)
        // Don't fail login if activity update fails
      }

      // Generate token
      const token = generateToken(user.id)

      return {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
        },
      }
    } catch (error) {
      console.error("❌ AuthService: Login error:", error)
      return {
        success: false,
        message: "Login failed. Please try again.",
      }
    }
  }

  // Verify token (simplified)
  async verifyToken(token: string) {
    try {
      const parts = token.split("_")
      if (parts.length !== 3) {
        return { valid: false, decoded: null }
      }

      const userId = parts[0]
      const user = await persistentForumDataStore.getUserById(userId)

      if (!user) {
        return { valid: false, decoded: null }
      }

      return {
        valid: true,
        decoded: {
          id: userId,
          username: user.username,
          role: user.role,
        },
      }
    } catch (error) {
      return {
        valid: false,
        decoded: null,
      }
    }
  }
}

export const authService = new AuthService()
