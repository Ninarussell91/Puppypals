import { useState } from 'react'
import {puppyList} from './data.js'

Function App() {
    
const [puppies, setPuppies] = useState(puppyList)

console.log("puppyList: ", puppyList);

return (
    <div className="App">
      {
        puppies.map((puppy) => {
             return <p key={puppy.id}>{puppy.name}</p>;
           })
       }
    </div>
  );
}

