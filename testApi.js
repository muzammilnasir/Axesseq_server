const axios = require('axios'); // You may need to install the axios package

const data = {
  // firstName: "demo",
  // lastName: "test",
  // email: "demotest@gmail.com",
  // password: "demotest",
  newPassword: "demotest",
//   content: "651aa41143761d9e3ffdab15",
  // quantity: 4 ,

};
const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTI3ZWRlODkxZTRiNGE2MTFlMGI1NDEiLCJyb2xlIjoidXNlciIsImlhdCI6MTY5NzU0NDA5NCwiZXhwIjoxNjk3NjMwNDk0fQ.3Wg_pBFzJs6NgHI-jV7XdYy8Rh9IC8FH8OGI7wPZmdU';

// axios.post('http://192.168.100.5:4000/api/auth/signin', data
axios.post('http://192.168.0.100:2000/user/reset', data,
// {headers: {
//   Authorization: `${jwtToken}`,
//   'Content-Type': 'application/json',
// }
// }
)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });


// const axios = require('axios');
// const fs = require('fs'); // Node.js filesystem module
// const FormData = require('form-data');

// // Create a FormData object
// const formData = new FormData();

// // Add category data to the FormData object
// formData.append('name', 'Cthi');
// formData.append('description', ' C products');
// formData.append('parent', '651a901015a353998cd9f9ef');

// // Add the image file to the FormData object
// const imageStream = fs.createReadStream('C:/Users/TECHDRIVE/Desktop/image.jpeg'); // Use forward slashes (works on Windows too)
// formData.append('categoryImage', imageStream);


// // Make the POST request with Axios
// axios.post('http://192.168.100.5:4000/api/categories', formData)
//   .then(response => {
//     console.log('Response:', response.data);
//   })
//   .catch(error => {
//     console.error('Error:', error.message);
//   });
