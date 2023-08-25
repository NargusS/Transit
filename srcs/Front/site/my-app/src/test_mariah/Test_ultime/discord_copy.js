import "./discord.css"
import Header from '../../Header';
import { useState } from "react";

const Discord = () => {
    const [activeTab, setActiveTab] = useState('');




    return(
        
        <div>
           {/* <div className="containo"> */}

            <div className="new_conv">
            <button className="button_conv">+</button>
                new conv
            </div>
            <div className="chat_title"> 
            2
            <div className="button_div">
                <button className="button_chat_title">Add member</button>
                <button className="button_chat_title">Chat profile</button>

            </div>
             </div>

            <div className="chat_list">
            <div className="msg_pv">
                messages privés
                <button className="msg_pv_btn">+</button>
            </div>            
            
            <button className={activeTab === 'Tokyo' ? 'chat_list links active' : 'chat_list links'}
                onClick={() => setActiveTab('Tokyo')}></button>

            </div>





           <div className="chat_content">4</div>
           <div className="chat_profile">5</div>
            <div className="my_profile">6</div>
            <div className="chat_bar">7</div>
           {/* </div> */}





        </div>
    )


























}

export default Discord;