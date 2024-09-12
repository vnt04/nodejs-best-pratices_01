import prisma from "../DB/database.config.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "Profile image is required" });
      }

      const profile = req.files.avatar;
      const message = imageValidator(profile?.size, profile?.mimetype);

      if (message !== null) {
        return res.status(400).json({ errors: { profile: message } });
      }

      const imageElements = profile?.name.split(".");
      const imageName = generateRandomNum() + "." + imageElements[1];
      const uploadPath = process.cwd() + "/images/" + imageName;

      profile.mv(uploadPath, (err) => {
        if (err) throw err;
      });
      await prisma.users.update({
        data: {
          profile: imageName,
        },
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        message: "Profile uploaded successfully!",
      });
    } catch (error) {
      console.log("Something went wrong: ", error);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again." });
    }
  }
}

export default ProfileController;
