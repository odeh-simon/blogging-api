const Blog = require('../models/Blog');

exports.getAllBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, state, author, title, tags, sort } = req.query;

    const query = { state: 'published' }; 
    if (state && state !== 'published') {
      return res.status(400).json({ message: 'Invalid state value. Only "published" blogs can be queried here. Use /drafts for draft blogs.' });
    }
    if (author) query.author = { $regex: author, $options: 'i' }; 
    if (title) query.title = { $regex: title, $options: 'i' };
    if (tags) query.tags = { $in: tags.split(',').map(tag => new RegExp(tag, 'i')) };

    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      if (['read_count', 'reading_time', 'timestamp'].includes(field)) {
        sortOption[field] = order === 'desc' ? -1 : 1;
      }
    }

    const blogs = await Blog.find(query)
      .populate('owner', 'first_name last_name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort(sortOption);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      total,
      data: { blogs },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDraftBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, title, tags, sort } = req.query;

    const query = { state: 'draft', owner: req.user._id };
    if (title) query.title = { $regex: title, $options: 'i' };
    if (tags) query.tags = { $in: tags.split(',') };

    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      if (['read_count', 'reading_time', 'timestamp'].includes(field)) {
        sortOption[field] = order === 'desc' ? -1 : 1;
      }
    }

    const blogs = await Blog.find(query)
      .populate('owner', 'first_name last_name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort(sortOption);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      total,
      data: { blogs },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const query = { _id: blogId };

    // Allow draft blogs to be accessed only by the owner
    if (req.user) {
      query.$or = [{ state: 'published' }, { state: 'draft', owner: req.user._id }];
    } else {
      query.state = 'published';
    }

    const blog = await Blog.findOne(query).populate('owner', 'first_name last_name email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or not accessible' });
    }

    blog.read_count += 1;
    await blog.save();

    res.status(200).json({
      status: 'success',
      data: { blog },
    });
  } catch (error) {
    next(error);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, description, tags, body, author } = req.body;
    const blog = await Blog.create({
      title,
      description,
      tags,
      author, 
      body,
      owner: req.user._id, 
    });

    res.status(201).json({
      status: 'success',
      data: { blog },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const { title, description, tags, body, state, author } = req.body;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.tags = tags || blog.tags;
    blog.author = author || blog.author;
    blog.body = body || blog.body;
    if (state && ['draft', 'published'].includes(state)) {
      blog.state = state;
    }

    await blog.save();

    res.status(200).json({
      status: 'success',
      data: { blog },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, state } = req.query;
    const query = { owner: req.user._id };
    if (state) query.state = state;

    const blogs = await Blog.find(query)
      .populate('owner', 'first_name last_name email')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      total,
      data: { blogs },
    });
  } catch (error) {
    next(error);
  }
};