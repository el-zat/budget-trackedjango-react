import React, {useContext, useState, useEffect} from "react"
import { DescriptionContext } from "../../context/DescriptionContext";
import { ExpensesContext } from "../../context/ExpensesContext";
import '../../styles/Description.scss'



function Description( {id} ) {

    const [description, setDescription] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const descriptionProviderValues = useContext(DescriptionContext)
    const expensesProviderValues = useContext(ExpensesContext)


    useEffect(() => {
        if (!id) return;
        // Load description from server
        fetch(`http://127.0.0.1:8000/api/myexpenses/${id}/`)
          .then(res => res.json())
          .then(data => {
            setDescription(data.description || "");
            setIsLoaded(true);
            setIsEditing(data.description); 
          })
          .catch(err => {
            setIsLoaded(true);
            setDescription("");
            console.error('Error description loading:', err);
          });
      }, [id]);


    const handleSaveDescription = async () => {       
        if (!id) return;
        await fetch(`http://127.0.0.1:8000/api/myexpenses/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description }),
          });
          setIsEditing(false);

        console.log('id in handleSaveDescription:', id, typeof id);

        expensesProviderValues.setHasDescription(id, true);
        
        if (expensesProviderValues.closeDescription) {
            expensesProviderValues.closeDescription();
        }
        console.log('description saved')
        
    }
    
      
    if (!isLoaded) return <div>Loading...</div>;      

    return  <div className="description">   
                <button 
                  className="close-description" 
                  onClick={descriptionProviderValues.closeDescription}
                  style = {{width: '30px'}}
                  >x
                  </button>            
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Add description..."
                    rows={5}
                    cols={40}
                />                          
                    <button className="save-btn"
                        onClick={handleSaveDescription}>Save
                    </button>                                             
            </div>      
}

export default Description