import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";
import prisma from "../DB/database.config.js";

class NewsController {
  static async index(req, res) {
    res.json({ message: "News page!" });
  }
  static async store(req, res) {
    try {
      const body = req.body;

      const user = req.user;

      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.json({ errors: { image: "Image can be empty!" } });
      }

      const image = req.files.image;
      const messageFile = imageValidator(image?.size, image?.mimetype);
      if (messageFile !== null) {
        return res.json({ errors: { image: messageFile } });
      }
      const imageElements = image?.name.split(".");
      const imageName = generateRandomNum() + "." + imageElements[1];
      const uploadPath = process.cwd() + "/images/" + imageName;

      image.mv(uploadPath, (error) => {
        if (error) throw error;
      });

      payload.image = imageName;
      payload.user_id = user.id;
      await prisma.news.create({
        data: payload,
      });

      return res.json({
        status: 200,
        message: "Created News successfully",
        payload,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({ message: "Something went wrong!" });
      }
    }
  }
  static async update(req, res) {}
  static async show(req, res) {}
  static async destroy(req, res) {}
}

export default NewsController;
