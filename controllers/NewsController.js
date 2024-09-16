import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import { deleteImage, imageValidator, uploadImage } from "../utils/helper.js";
import prisma from "../DB/database.config.js";
import NewsApiTransform from "../dataTransform/newsApiTransform.js";

class NewsController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0 || limit >= 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;
    const data = await prisma.news.findMany({
      take: limit,
      skip: skip,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true, //may be have default user image for error case
          },
        },
      },
    });

    const totalNews = prisma.news.count();
    const totalPages = Math.ceil(totalNews / limit);

    const newsTransform = data?.map((item) => {
      return NewsApiTransform.transform(item);
    });
    return res.json({
      status: 200,
      news: newsTransform,
      metadata: {
        totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    });
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
      const imageName = uploadImage(image);

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
  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;

      const news = await prisma.news.findUnique({
        where: { id: Number(id) },
      });

      if (user.id !== news.user_id) {
        return res.json({ status: 401, message: "Unauthorized!" });
      }
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      //upload new image
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.json({ status: 400, message: "Image can not empty!" });
      }
      // + check image mime
      const image = req.files?.image;
      const messageFile = imageValidator(image?.size, image?.mimetype);
      if (messageFile !== null) {
        return res.status(400).json({ errors: { image: messageFile } });
      }

      const imageName = uploadImage(image);
      payload.image = imageName;
      // delete old image
      deleteImage(news?.image);

      await prisma.news.update({
        data: payload,
        where: { id: Number(id) },
      });

      return res.json({ status: 200, message: "News updated successfully!" });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong!" });
      }
    }
  }

  static async show(req, res) {
    const { id } = req.params;
    try {
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });
      const newsTransform = news ? NewsApiTransform.transform(news) : null;
      return res.json({ status: 200, news: newsTransform });
    } catch (error) {
      return res.json({ status: 500, message: "Something went wrong!" });
    }
  }
  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const news = await prisma.news.findUnique({
        where: { id: Number(id) },
      });
      if (user.id !== news.user_id) {
        return res.json({ status: 400, message: "Unauthorized!" });
      }

      deleteImage(news.image);
      await prisma.news.delete({
        where: { id: Number(id) },
      });

      return res.json({ status: 200, message: "News deleted successfully!" });
    } catch (error) {
      return res.json({ status: 500, message: "Something went wrong!" });
    }
  }
}

export default NewsController;
