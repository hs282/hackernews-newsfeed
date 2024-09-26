import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from "react";

// add sorting button to sort through jobs and stories based on posting time

/*
pagination logic:

data storage using useState hook to store data fetched
from server. initailize to empty array

loading indicator: set up loading state to notify users
when data is being fetched. initialize to false

create current page state to keep track of currently displayed page

posts per page: implement state to manage number of posts displayed
displayed per page
*/

function usePagination(posts, postsPerPage) {
  const pageNumberLimit = 5; // max number of page numbers that can be displayed at once
  const [pageNumber, setPageNumber] = useState(1);
  const [minPageNumberLimit, setMinPageNumberLimit] = useState(1);
  const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(pageNumberLimit);
  const pageCount = Math.ceil(posts.length / postsPerPage);

  const changePage = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  const pageData = () => {
    const start = (pageNumber - 1) * postsPerPage;
    const end = start + postsPerPage;
    return posts.slice(start, end);
  }

  const handleNextPage = () => {
    setPageNumber(pageNumber + 1);
    if (pageNumber + 1 > maxPageNumberLimit) {
      setMinPageNumberLimit(minPageNumberLimit + pageNumberLimit);
      setMaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit);
    }
  }

  const handlePrevPage = () => {
    setPageNumber(pageNumber - 1);
    if (pageNumber - 1 < minPageNumberLimit) {
      setMinPageNumberLimit(minPageNumberLimit - pageNumberLimit);
      setMaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit);
    }
  }

  return {
    pageNumber,
    minPageNumberLimit,
    maxPageNumberLimit,
    pageCount,
    changePage,
    pageData,
    handleNextPage,
    handlePrevPage,
  };
}

function Pagination(props) {
  const { pageNumber, minPageNumberLimit, maxPageNumberLimit, changePage, pageData, handleNextPage, handlePrevPage, pageCount } = usePagination(props.posts, props.postsPerPage);

  const pageNumbers = [];
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (pageNum <= maxPageNumberLimit && pageNum >= minPageNumberLimit) {
      pageNumbers.push(pageNum);
    }
  }
  
  useEffect(() => {
    props.setPagePosts(pageData);
  }, [pageNumber, pageData]);

  return (
    <div className={styles.paginationButtonGroup}>
      <button onClick={() => handlePrevPage()} disabled={pageNumber === 1} className={styles.changePageBtn}>Prev</button>
        <div className={styles.pageNumbers}>
        {pageNumbers.map((pageNum) => 
          <span
          key={pageNum}
          id={pageNum}
          onClick={() => changePage(pageNum)}
          className={`${styles.pageNumber} ${pageNum === pageNumber && styles.pageNumberSelected}`}
          >
            {pageNum}
          </span>
        )}
        </div>
      <button onClick={() => handleNextPage()} disabled={pageNumber === pageCount} className={styles.changePageBtn}>Next</button>
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("newsStories");
  const [jobs, setJobs] = useState([]);
  const [newsStories, setNewsStories] = useState([]);
  const [postsOnCurrPage, setPostsOnCurrPage] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingNewsStories, setLoadingNewsStories] = useState(false);

  const postsPerPage = 10;

  useEffect(() => {
    const getJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/jobstories.json`);
        const jobIds = await response.json();
        const jobs = await Promise.all(jobIds.map(jobId => fetch(`https://hacker-news.firebaseio.com/v0/item/${jobId}.json`).then(response => response.json())));
        setJobs(jobs);
        setLoadingJobs(false);
        console.log(jobs);
      } catch (error) {
        console.log(error);
      }
    }
  
    const getNewsStories = async () => {
      setLoadingNewsStories(true);
      try {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/newstories.json`);
        const newsStoryIds = await response.json();
        const newsStories = await Promise.all(newsStoryIds.map(newsStoryId => fetch(`https://hacker-news.firebaseio.com/v0/item/${newsStoryId}.json`).then(response => response.json())));
        setNewsStories(newsStories);
        setLoadingNewsStories(false);
      } catch (error) {
        console.log(error);
      }
    }

    getJobs();
    getNewsStories();
  }, [loadingJobs, loadingNewsStories, jobs, newsStories, activeTab]);

  return (
    <div className={styles.container}>
      <Head>
        <title>HackerNews Feed</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className={styles.title}>
        HackerNews
      </h1>
      <div className={styles.tabButtonGroup}>
        <button className={`${styles.tabButton} ${activeTab === "jobs" && styles.activeTabButton}`} onClick={() => setActiveTab("jobs")}>Jobs</button>
        <button className={`${styles.tabButton} ${activeTab === "newsStories" && styles.activeTabButton}`} onClick={() => setActiveTab("newsStories")}>News</button>
      </div>
      <div className={styles.jobList}>
        {
        postsOnCurrPage.map(post => 
          <div className={styles.jobPosting}>
            <span>{post.title}</span>
            
            {post.url && <a href={post.url}>{post.url}</a>}
          </div>
        )
      }
    </div>
    
    <div className={styles.paginationComponent}>
        <Pagination
          clasName={styles.paginationComponent}
          posts={activeTab === "jobs" ? jobs : newsStories}
          postsPerPage={postsPerPage}
          setPagePosts={setPostsOnCurrPage}
        />
    </div>
  </div>
  );
}
