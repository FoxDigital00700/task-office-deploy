import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const seedSuperAdmin = async () => {
    try {
        const superAdmins = [
            {
                email: "foxdigital01@gmail.com",
                password: "foxsuperadmin01",
                name: "Super Admin 01",
                employeeId: "SA01",
            },
            {
                email: "foxdigital02@gmail.com",
                password: "foxsuperadmin02",
                name: "Super Admin 02",
                employeeId: "SA02",
            },
        ];

        for (const admin of superAdmins) {
            const existingUser = await User.findOne({ email: admin.email });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(admin.password, 10);
                await User.create({
                    name: admin.name,
                    email: admin.email,
                    password: hashedPassword,
                    role: "Super Admin",
                    employeeId: admin.employeeId,
                    joiningDate: new Date(),
                });
                console.log(`✅ Super Admin created: ${admin.email}`);
            } else {
                // console.log(`ℹ️ Super Admin already exists: ${admin.email}`);
            }
        }
    } catch (error) {
        console.error("❌ Error seeding Super Admins:", error);
    }
};

export default seedSuperAdmin;
