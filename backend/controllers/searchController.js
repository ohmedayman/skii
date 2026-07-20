const { client: searchClient } = require('../config/meilisearch');

const searchBusinesses = async (req, res) => {
  try {
    const { q, city, category, sort = 'rating.average:desc', limit = 20, page = 1 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const index = searchClient.index('businesses');

    let filter = ['isActive = true'];
    if (city) filter.push(`location.city = "${city}"`);
    if (category) filter.push(`categoryId = "${category}"`);

    const result = await index.search(q, {
      filter: filter.join(' AND '),
      sort: [sort],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      attributesToHighlight: ['name', 'nameAr'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return res.json({
      hits: result.hits,
      query: q,
      totalHits: result.estimatedTotalHits,
      processingTime: result.processingTimeMs,
      page: parseInt(page),
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
};

const searchPosts = async (req, res) => {
  try {
    const { q, category, limit = 20, page = 1 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const index = searchClient.index('posts');

    let filter = ['status = "published"'];
    if (category) filter.push(`category = "${category}"`);

    const result = await index.search(q, {
      filter: filter.join(' AND '),
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      attributesToHighlight: ['title', 'titleAr'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return res.json({
      hits: result.hits,
      query: q,
      totalHits: result.estimatedTotalHits,
      processingTime: result.processingTimeMs,
      page: parseInt(page),
    });
  } catch (error) {
    console.error('Search posts error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
};

const searchAll = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const [businessResults, postResults] = await Promise.all([
      searchClient.index('businesses').search(q, {
        filter: 'isActive = true',
        limit: parseInt(limit),
        attributesToHighlight: ['name', 'nameAr'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      }),
      searchClient.index('posts').search(q, {
        filter: 'status = "published"',
        limit: parseInt(limit),
        attributesToHighlight: ['title', 'titleAr'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      }),
    ]);

    return res.json({
      businesses: businessResults.hits,
      posts: postResults.hits,
      query: q,
    });
  } catch (error) {
    console.error('Search all error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const result = await searchClient.index('businesses').search(q, {
      filter: 'isActive = true',
      limit: 5,
      attributesToRetrieve: ['name', 'nameAr', 'categoryName', 'location.city'],
    });

    const suggestions = result.hits.map(hit => ({
      name: hit.name,
      nameAr: hit.nameAr,
      category: hit.categoryName,
      city: hit.location?.city,
    }));

    return res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    return res.status(500).json({ error: 'Failed to get suggestions' });
  }
};

module.exports = { searchBusinesses, searchPosts, searchAll, getSearchSuggestions };
