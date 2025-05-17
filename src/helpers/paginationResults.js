const paginationResults = (data, refinedData = null) => ({
    count: refinedData ? refinedData.length : data.docs.length,
    totalCount: data.totalDocs,
    pages: data.totalPages,
    ...(data.hasNextPage && { next: data.nextPage }),
    ...(data.hasPrevPage && { prev: data.prevPage }),
    data: refinedData || data.docs,
  });
  
  export default paginationResults;
  