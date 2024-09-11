import prisma from "../DB/database.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // check if email exist
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });
      if (findUser) {
        return res.status(400).json({ errors: "Email exists!" });
      }
      // Encrypt the password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      const user = await prisma.users.create({
        data: payload,
      });
      return res
        .status(201)
        .json({ message: "User created successfully", user });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // find user email is login
      const findUser = await prisma.users.findUnique({
        where: { email: payload.email },
      });
      if (findUser) {
        if (bcrypt.compareSync(payload.password, findUser.password)) {
          const payloadData = {
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            profile: findUser.profile,
          };
          const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
            expiresIn: "30s",
          });
          return res
            .status(200)
            .json({
              message: "Successfully Login",
              access_token: `Bearer ${token}`,
            });
        } else {
          return res.json({ errors: { password: "Password is incorrect!" } });
        }
      }

      return res
        .status(400)
        .json({ errors: { email: "Email can not found!" } });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      }
    }
  }
}

export default AuthController;
