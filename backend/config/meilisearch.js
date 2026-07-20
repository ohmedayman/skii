const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
  host: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILI_MASTER_KEY,
});

const initSearchIndexes = async () => {
  try {
    await client.index('businesses').updateSettings({
      searchableAttributes: ['name', 'nameAr', 'categoryName', 'categoryNameAr', 'location.city', 'location.cityAr', 'tags'],
      filterableAttributes: ['categoryId', 'location.city', 'isActive', 'isVerified', 'rating.average', 'priceRange'],
      sortableAttributes: ['rating.average', 'totalFavorites', 'createdAt', 'totalViews'],
      rankingRules: [
        'sort',
        'words',
        'typo',
        'proximity',
        'attribute',
        'exactness',
      ],
    });

    await client.index('posts').updateSettings({
      searchableAttributes: ['title', 'titleAr', 'category', 'tags'],
      filterableAttributes: ['status', 'category', 'isFeatured'],
      sortableAttributes: ['publishedAt', 'views', 'likes'],
    });

    console.log('Search indexes configured');
  } catch (error) {
    console.warn('Meilisearch not available:', error.message);
  }
};

module.exports = { client, initSearchIndexes };
