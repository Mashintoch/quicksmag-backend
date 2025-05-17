import { POSTS_PER_PAGE } from "../configs/constants";

const paginate = () => (req, res, next) => {
  const page = req.query.page ? +req.query.page : 1;
  const limit = req.query.limit ? +req.query.limit : POSTS_PER_PAGE;

  req.pagination = {
    page,
    limit,
  };

  next();
};
export default paginate;
