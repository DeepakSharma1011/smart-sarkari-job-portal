/**
 * ApiFeatures class for advanced query building.
 * Supports search, filter, sort, field selection, and pagination.
 */
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // Search by keyword in jobName and department
  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            { jobName: { $regex: this.queryStr.keyword, $options: 'i' } },
            { department: { $regex: this.queryStr.keyword, $options: 'i' } },
            { description: { $regex: this.queryStr.keyword, $options: 'i' } },
          ],
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  // Filter by qualification, field, status, etc.
  filter() {
    const queryCopy = { ...this.queryStr };

    // Remove fields that are not filters
    const removeFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Handle qualification hierarchy for filtering
    if (queryCopy.qualificationRequired && queryCopy.qualificationRequired !== 'All') {
      const QUALIFICATION_HIERARCHY = {
        '10th': 1,
        '12th': 2,
        'ITI': 2,
        'Diploma': 3,
        'Graduation': 4,
        'Post Graduation': 5,
        'PhD': 6,
      };
      
      const selectedQual = queryCopy.qualificationRequired;
      const targetLevel = QUALIFICATION_HIERARCHY[selectedQual];
      if (targetLevel) {
        const eligibleQuals = Object.entries(QUALIFICATION_HIERARCHY)
          .filter(([, level]) => level <= targetLevel)
          .map(([qual]) => qual);
        
        queryCopy.qualificationRequired = { $in: eligibleQuals };
      }
    }

    // Advanced filtering for gt, gte, lt, lte, in
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/(?<!\$)\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort results
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default: sort by nearest deadline first
      this.query = this.query.sort('lastDate');
    }
    return this;
  }

  // Select specific fields
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  // Paginate results
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = ApiFeatures;
