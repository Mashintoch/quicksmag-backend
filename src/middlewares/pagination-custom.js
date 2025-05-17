import { POSTS_PER_PAGE } from "../configs/constants";

const pagination =
  (model, filterOptions = {}) =>
  async (req, res, next) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10) || POSTS_PER_PAGE;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginationResults = {};
    const modelCollectionCount = await model
      .countDocuments(filterOptions)
      .exec();

    const totalPages = Math.ceil(modelCollectionCount / limit);

    if (endIndex < modelCollectionCount) {
      paginationResults.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      paginationResults.prev = {
        page: page - 1,
        limit,
      };
    }

    res.pagination = {
      ...paginationResults,
      startIndex,
      limit,
      pages: totalPages,
      totalCount: Number(modelCollectionCount),
    };

    next();
  };

export default pagination;
