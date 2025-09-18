import React, {useContext, useEffect} from "react"
import  '../styles/Sort.scss'
import { SortContext } from "../context/SortContext"
import { ModalContext } from "../context/ModalContext";
import Modal from './Modal';


const Sort = () => {

    const sortProviderValues = useContext(SortContext)
    const modalProviderValues = useContext(ModalContext);

    console.log("SortContext:", sortProviderValues);

    
    return      <React.Fragment>                
                    <Modal isOpen={modalProviderValues.isModalSortOpen} onClose={() => 
                        modalProviderValues.setIsModalSortOpen(false)}>
                            <div className="sort-container">                                                        
                                <div className="sort-date">
                                    <label>
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="date-dec"
                                        checked={sortProviderValues.selectedSort === "date-dec"}
                                        onChange={e => {
                                            sortProviderValues.onSortChange(e.target.value);
                                        }}
                                    />
                                    By date: newest first 
                                    </label>
                                </div>                                
                                <div className="sort-date">
                                    <label>
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="date-inc"
                                        checked={sortProviderValues.selectedSort === "date-inc"}
                                        onChange={e => {
                                            sortProviderValues.onSortChange(e.target.value);
                                        }}
                                    />
                                    By date: oldest first 
                                    </label>
                                </div>                                
                                <div className="sort-category">
                                    <label>
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="category"
                                        checked={sortProviderValues.selectedSort === "category"}
                                        onChange={e => {
                                            sortProviderValues.onSortChange(e.target.value);
                                        }}
                                    />
                                    By category <i className="material-icons">sort_by_alpha</i>
                                    </label>
                                </div>                                
                                <div className="sort-price">
                                    <label>
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="price-inc"
                                        checked={sortProviderValues.selectedSort === "price-inc"}
                                        onChange={e => {
                                            sortProviderValues.onSortChange(e.target.value);
                                        }}
                                    />
                                    Price accending <i className="material-icons">arrow_upward</i>
                                    </label>
                                </div>                                
                                <div className="sort-price">
                                    <label>
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="price-dec"
                                        checked={sortProviderValues.selectedSort === "price-dec"}
                                        onChange={e => {
                                            sortProviderValues.onSortChange(e.target.value);
                                        }}
                                    />
                                    Price decendig <i className="material-icons">arrow_downward</i>
                                    </label>
                                </div>                                                
                            </div>                       
                    </Modal>   
                </React.Fragment>
}
    
export {Sort}