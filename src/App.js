import logo from './logo.svg';
import './App.css';
import React from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';  
//import Button from 'bootstrap';
import { Button } from 'bootstrap'; 

const Pagination = ({ items, pageSize, totalPages, onPageChange }) => {
  //const { Button } = react-bootstrap;
  if (items.length <= 1) return null;
  
  //let num = Math.ceil(items.length / pageSize); //No need because API handles total pages and pagination
  //   let pages = range(1, num + 1);
  let pages = range(1, totalPages);
  const list = pages.map(page => {
    return (
      <button class="btn btn-primary" key={page} onClick={onPageChange}>{page}</button>
      // <Button key={page} onClick={onPageChange} className="page-item">
      //   {page}
      // </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });
  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("42153135");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange?fields=src_line_nbr,country,country_currency_desc,currency,exchange_rate,record_date&filter=record_date:gte:2023-09-01&page%5Bsize%5D=${pageSize}&page[number]=${currentPage}",
    {
      hits: []
    }
  );
  const handlePageChange = e => {
    let gotopage=Number(e.target.textContent);
    console.log(`Se presionó el botón: ${gotopage}`);
    setCurrentPage(gotopage);
  };
  let page = data.data; // already have the items in one page
  let meta = data.meta; //, 'total-pages: totalpages'}; //gets all the metadata information, element count, total pages, etc.

  if (meta == undefined) return null;

  //if (page.length >= 1) {
    //page = paginate(page, currentPage, pageSize); No need the API controls the pagination
    console.log(`currentPage: ${currentPage}`);
  //}
  return (
       <Fragment>
      <form
        onSubmit={event => {
          doFetch("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange?fields=src_line_nbr,country,country_currency_desc,currency,exchange_rate,record_date&filter=record_date:gte:2023-09-01&page%5Bsize%5D=${pageSize}&page[number]=${currentPage}");
          event.preventDefault();
        }}
      >
        <input
          type="number"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {page.map(item => (
            <li key={item.src_line_nbr}>
              País: {item.country}    Tipo de Cambio:$ {item.exchange_rate}    Moneda:{item.currency}     Fecha:{item.record_date}
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={meta['total-count']}
        pageSize={pageSize}
        totalPages={meta['total-pages']}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

export default App;
