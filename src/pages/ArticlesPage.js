import React, { useState, useEffect } from "react";
import ArticlesList from "../components/ArticlesList";
import NotFoundPage from "./NotFoundPage";
import articleContent from "./article-content";

const ArticlePage = ({ match }) => {
  const name = match.params.name;
  let article = articleContent.find(article => article.name === name);
  
  const [upvoted, setUpvoted] = useState(0)
  const [articleFromDB, setArticleFromDB] = useState({name:"", upvotes: 0, content: [] })
  
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(`http://localhost:8000/api/articles/${name}`);
      const body = await result.json();
      setArticleFromDB(body)
    };
    fetchData();
  }, [name]);


  useEffect(() => {
    const upVoteArticle = () => {
      fetch(`http://localhost:8000/api/articles/${articleFromDB.name}/upvote`, {method: 'POST'})
    }
    if(articleFromDB.name !== "") upVoteArticle()
    setUpvoted(1)
  }, [upvoted, articleFromDB.name])

  if(!article) return <NotFoundPage />;

  const otherArticles = articleContent.filter(article => article.name !== name);

  return (
    <>
      {/* this article will be from db when it displays */}
      { articleFromDB.name === "" ? 
        <p>loading...</p> : 
        <>
          <h1>{articleFromDB.title}</h1>
          <p>This post has been upvoted {articleFromDB.upvotes} times</p>
          {articleFromDB.content.map((paragraph, key) => (
            <p key={key}>{paragraph}</p>
          ))}
        </> 
      }
      
      {/* these article are not from db */}
      <h3>Other Articles:</h3>
      <ArticlesList articles={otherArticles} />
    </>
  );
};

export default ArticlePage;
