import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import Review from './Review'
import ReviewForm from './ReviewForm'
import Header from './Header'
import GetNested from '../../utils/Helpers/GetNested'

const Column = styled.div`
  background: #fff; 
  max-width: 50%;
  width: 50%;
  float: left; 
  height: 100vh;
  overflow-x: scroll;
  overflow-y: scroll; 
  overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`

const Airline = (props) => {
  const [airline, setAirline] = useState({})
  const [review, setReview] = useState({})

  useEffect(()=> {
    const slug = props.match.params.slug
    const url = `/api/v1/airlines/${slug}`

    axios.get(url)
    .then( (resp) => setAirline(resp.data))
    .catch( data => console.log('Error', data) )
  }, [])

  // Modify text in review form
  const handleChange = (e) => {
    e.preventDefault()

    setReview(Object.assign({}, review, {[e.target.name]: e.target.value}))
  }

  // Create a review
  const handleSubmit = (e) => {
    e.preventDefault()

    const airline_id = parseInt(airline.data.id)

    axios.post('/api/v1/reviews', { ...review, airline_id })
    .then( (resp) => {
      const included = [ ...airline.included, resp.data.data ]
      setAirline({ ...airline, included })
      setReview({ title: '', description: '', score: 0 })
    })
    .catch( data => console.log('Error', data) )
  }

  // Destroy a review
  const handleDestroy = (id, e) => {
    e.preventDefault()

    axios.delete(`/api/v1/reviews/${id}`)
    .then( (data) => {
      const included = [...airline.included]
      const index = included.findIndex( (data) => data.id == id )
      included.splice(index, 1)

      setAirline({ ...airline, included })
    })
    .catch( data => console.log('Error', data) )
  }

  // set score
  const setRating = (score, e) => {
    e.preventDefault()  
    setReview({ ...review, score })
  }

  const name = GetNested(airline, 'data', 'attributes', 'name')
  const image_url = GetNested(airline, 'data', 'attributes', 'image_url')
  
  let total, average = 0
  let reviews, included

  if (airline.included) {
    total = airline.included.reduce((total, review) => total + review.attributes.score, 0)
    average = total > 0 ? (parseFloat(total) / parseFloat(airline.included.length)) : 0
    
    reviews = airline.included.map( (review, index) => {
      return (
        <Review 
          key={index}
          id={review.id}
          attributes={review.attributes}
          handleDestroy={handleDestroy}
        />
      )
    })
  }

  return(
    <div>
      <Column>
        <Header 
          image_url={image_url}
          name={name}
          reviews={airline.included}
          average={average}
        />
        {reviews}
      </Column>
      <Column>
        <ReviewForm
          name={name}
          review={review}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setRating={setRating}
        />
      </Column>
    </div>
  )
}

export default Airline