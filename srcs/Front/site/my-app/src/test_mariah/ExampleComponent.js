import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExampleComponent = () => {
  const [responseData, setResponseData] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000');
        setResponseData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Response from Backend:</h1>
      <p>{responseData}</p>
    </div>
  );
};

export default ExampleComponent;

// const handleButtonLogin= () => {navigate('/auth/42');};
 // console.log(response);
    // const handleButtonLogin=() => {navigate('/auth/42');};
    //     axios.get('http://172.20.0.3:3000/auth/42')
    //     // axios.get('http://localhost:4000/auth/42')
    //     .then(response => {
    //         console.log(response.data);
    //     })
    //     .catch(error =>
    //         console.log(error.response.data.message));

    // };