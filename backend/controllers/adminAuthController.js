    import bcrypt from "bcrypt";
    import Admin from "../models/Admin.js";


    const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find admin
        const admin = await Admin.findOne({
        email: cleanEmail,
        });

        if (!admin) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
        }

        // Check active status
        if (!admin.isActive) {
        return res.status(403).json({
            message: "Admin account is inactive",
        });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
        password,
        admin.password
        );

        if (!isMatch) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
        }

        // Create admin session
        req.session.adminId = admin._id.toString();

        console.log(
        "ADMIN SESSION CREATED:",
        req.session.adminId
        );

        return res.status(200).json({
        message: "Admin login successful",

        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
        },
        });

    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
        message: "Admin login failed",
        });
    }
    };
    export const adminLogout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
        console.error("Admin logout error:", error);

        return res.status(500).json({
            message: "Logout failed",
        });
        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
        message: "Admin logout successful",
        });
    });
    };

    
    export default adminLogin;