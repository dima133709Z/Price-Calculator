

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/styles.css'
const PriceCalculator: React.FC = () => {
    const [ethAmount, setEthAmount] = useState<number>(0);
    const [action, setAction] = useState<string>('buy');
    const [usdtAmount, setUsdtAmount] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
                    params: { symbol: 'ethusdt' },
                });

                const ethPrice = parseFloat(response.data.price);
                const calculatedUsdtAmount = action === 'buy' ? ethAmount * ethPrice : ethAmount / ethPrice;

                setUsdtAmount(calculatedUsdtAmount);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const binanceWebSocket = new WebSocket(
            'wss://stream.binance.com:9443/ws/ethusdt@trade'
        );

        binanceWebSocket.onmessage = (event) => {
            const parsedMessage = JSON.parse(event.data);

            if (parsedMessage.e === 'trade') {
                const ethPrice = parseFloat(parsedMessage.p);
                const updatedUsdtAmount =
                    action.toLowerCase() === 'buy' ? ethAmount * ethPrice : ethAmount / ethPrice;
                setUsdtAmount(updatedUsdtAmount);
            }
        };

        return () => {
            binanceWebSocket.close();
        };
    }, [ethAmount, action]);
    return (
        <div className="container">
            <h1>USDT/ETH Price Calculator</h1>
            <label>
                ETH Amount:
                <input
                    type="number"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(parseFloat(e.target.value))}
                />
            </label>
            <label>
                Action:
                <select value={action} onChange={(e) => setAction(e.target.value)}>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                </select>
            </label>
            <div>
                <strong>USDT Amount:</strong> {usdtAmount !== null ? usdtAmount.toFixed(2) : <span className="loading">Loading...</span>}
            </div>
        </div>
    );
};

export default PriceCalculator;
