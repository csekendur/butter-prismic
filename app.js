const Prismic = require('prismic-javascript');
const PrismicDOM = require('prismic-dom');
const request = require('request');
const PrismicConfig = require('./prismic-configuration');
const app = require('./config');
const Onboarding = require('./onboarding');

const PORT = app.get('port');

app.listen(PORT, () => {
  Onboarding.trigger();
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: PrismicConfig.apiEndpoint,
    linkResolver: PrismicConfig.linkResolver,
  };
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM;
  Prismic.api(PrismicConfig.apiEndpoint, {
    accessToken: PrismicConfig.accessToken,
    req,
  }).then((api) => {
    req.prismic = { api };
    next();
  }).catch((error) => {
    next(error.message);
  });
});

const HTML_PAGES = [
  'services',
];

/*
 * Route with documentation to build your project with prismic
 */
app.route('/').get(function(req, res) {
  //req.prismic.api.getSingle('work-page').then(function(document) {
  //  res.render('index', { document });
  //});

  const promise_page_content = req.prismic.api.getSingle('work-page');
  const promise_meta = req.prismic.api.getSingle('meta-description');
  const promises = [promise_page_content, promise_meta];

  Promise.all(promises).then((values) => {
    const document = values[0];
    const meta_data = GetMetaTags(values[1]);

    res.render('index', { document, meta_data });
  });

});

for (let page of HTML_PAGES) {
  app.route(`/${page}.html`).get(function(req, res) {
     res.render(page);
  });
}

app.route('/work-subpage/:projectId').get(function(req, res) {

  //req.prismic.api.getByUID('work-subpage', req.params.projectId).then((document) => {
  //  res.render('work-subpage', { document });
  //});

  const promise_page_content = req.prismic.api.getByUID('work-subpage', req.params.projectId);
  const promise_meta = req.prismic.api.getSingle('meta-description');
  const promises = [promise_page_content, promise_meta];

  Promise.all(promises).then((values) => {
    const document = values[0];
    const meta_data = GetMetaTags(values[1]);

    res.render('work-subpage', { document, meta_data });
  });
});

app.route('/news.html').get(function(req, res) {
  //req.prismic.api.query(Prismic.Predicates.at('document.type', 'news-post'),{ orderings : '[my.news-post.date desc]' }).then(function(response) {
  //  const results = response.results;
  //  results.sort((a, b) => {
  //    const firstOrder = a.data['order-number'];
  //    const secondOrder = b.data['order-number'];
  //    if (secondOrder === null) {
  //      return -1;
  //    }
  //    if (firstOrder === null) {
  //      return 1;
  //    }
  //    return firstOrder < secondOrder ? -1 : 1;
  //  });

  //  res.render('news', { newsItems: results });
  //});

  const promise_page_content = req.prismic.api.query(Prismic.Predicates.at('document.type', 'news-post'), { orderings: '[my.news-post.date desc]' })
  const promise_meta = req.prismic.api.getSingle('meta-description');
  const promises = [promise_page_content, promise_meta];

  Promise.all(promises).then((values) => {
    const results = values[0].results;
    results.sort((a, b) => {
      const firstOrder = a.data['order-number'];
      const secondOrder = b.data['order-number'];
      if (secondOrder === null) {
        return -1;
      }
      if (firstOrder === null) {
        return 1;
      }
      return firstOrder < secondOrder ? -1 : 1;
    });

    const meta_data = GetMetaTags(values[1]);

    res.render('news', { newsItems: results, meta_data });
  });

});

app.route('/contact.html').get(function (req, res) {

  //req.prismic.api.getSingle('contact-page').then(function (document) {
  //  const contactParagraph = document.data['contact-paragraph'];
  //  res.render('contact', { contactParagraph });
  //});

  //req.prismic.api.getSingle('meta-description').then(function (document) {
  //  console.log(document);
  //  var meta_image_url = document.data['meta-image'].url;
  //  console.log(meta_image_url);
  //  const contactParagraph = document.data['meta-title'];
  //  res.render('contact', { contactParagraph });
  //});

  const promise_page_content = req.prismic.api.getSingle('contact-page');
  const promise_meta = req.prismic.api.getSingle('meta-description');
  const promises = [promise_page_content, promise_meta];

  Promise.all(promises).then((values) => {
    var page_content = values[0];
    const contactParagraph = page_content.data['contact-paragraph'];

    const meta_data = GetMetaTags(values[1]);
    
    res.render('contact', { contactParagraph, meta_data });
  });

});

app.route('/work.html').get(function(req, res) {

  //req.prismic.api.getSingle('work-page').then(function (document) {
  //  res.render('work', { document });
  //});

  const promise_page_content = req.prismic.api.getSingle('work-page');
  const promise_meta = req.prismic.api.getSingle('meta-description');
  const promises = [promise_page_content, promise_meta];

  Promise.all(promises).then((values) => {
    const document = values[0];
    const meta_data = GetMetaTags(values[1]);

    res.render('work', { document, meta_data });

  });

});

app.route('/about.html').get(function(req, res) {
  //req.prismic.api.query(Prismic.Predicates.at("document.tags", ['about'])).then(function(response) {
  //  const document = response.results[0];
  //  res.render('about', { document });
  //});

  const promise_page_content = req.prismic.api.query(Prismic.Predicates.at("document.tags", ['about']));
  const promise_meta = req.prismic.api.getSingle('meta-description');
  const promises = [promise_page_content, promise_meta];

  Promise.all(promises).then((values) => {
    const document = values[0].results[0];
    const meta_data = GetMetaTags(values[1]);

    res.render('about', { document, meta_data });

  });
});

function GetMetaTags(meta_data_result) {
  var meta_data = {};
  if (meta_data_result != null) {
    meta_data.meta_title = PrismicDOM.RichText.asText(meta_data_result.data['meta-title']);
    meta_data.meta_description = PrismicDOM.RichText.asText(meta_data_result.data['meta-description']);
    meta_data.meta_image_url = meta_data_result.data['meta-image'].url;
  } else {
    meta_data.meta_title = "";
    meta_data.meta_description = "";
    meta_data.meta_image_url = "";
  }

  return meta_data;
}
/*
 * Preconfigured prismic preview
 */
app.get('/preview', (req, res) => {
  const { token } = req.query;
  if (token) {
    req.prismic.api.previewSession(token, PrismicConfig.linkResolver, '/').then((url) => {
      res.redirect(302, url);
    }).catch((err) => {
      res.status(500).send(`Error 500 in preview: ${err.message}`);
    });
  } else {
    res.send(400, 'Missing token from querystring');
  }
});
