import { getImageURL } from "../utils/helper.js";

class NewsApiTransform {
  static transform(news) {
    return {
      id: news.id,
      heading: news.title,
      news: news.content,
      image: getImageURL(news.image),
      author: news.user,
      created_at: news.created_at,
    };
  }
}

export default NewsApiTransform;
