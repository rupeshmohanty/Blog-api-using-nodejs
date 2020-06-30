const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const Article = require('./models/article');

const app = express();

//Mongoose connection
mongoose.connect('mongodb://localhost:27017/blog',{ useNewUrlParser : true , useUnifiedTopology : true },() => {
    console.log('Connected to the database!');
});

//Port no
const PORT = 5000;

//EJS
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended : false }));
app.use(expressLayouts);
app.set('view engine','ejs');

//Getting main pages
app.get('/',async (req,res) => {
    const articles = await Article.find().sort({ createdAt : 'desc' });
    res.render('index',{ articles : articles });
});

app.get('/new',(req,res) => {
    res.render('new', { article: new Article() });
});

app.get('/:id',async (req,res) => {
    const article = await Article.findById(req.params.id);
    if (article == null) res.redirect('/');
    res.render('show', { article: article });
});

//Sending POST requests
app.post('/new',async (req,res,next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect('new'));

//Editing the post
app.put('/:id', async(req,res,next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit'));


//To delete a post
app.delete('/:id', async(req,res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

//To edit a post
app.get('/edit/:id',async (req,res) => {
    const article = await Article.findById(req.params.id);
    res.render('edit', { article: article });
});

function saveArticleAndRedirect(path) {
    return async(req,res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;
        try{
            article = await article.save();
            res.redirect(`/${article.id}`);
        } catch(err) {
            res.render(`/${path}`,{ article: article });
        }
    }
}

app.listen(PORT,console.log(`Listening at port ${PORT}`));