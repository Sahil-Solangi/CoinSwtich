# Perpetual Futures Trading Interface

## Overview

A fully functional perpetual futures trading interface for your CoinSwitch platform. Users can click on any cryptocurrency from the market overview or trading table to access a dynamic trading interface.

## Files Created

### 1. **trade.html**

- Dynamic trading interface page
- Displays trading pair information (symbol, live price, 24h change)
- Responsive design with chart and trading controls

### 2. **assets/css/trade.css**

- Complete styling for the trading interface
- Dark theme matching your platform
- Responsive layouts for desktop and mobile
- Beautiful animations and transitions

### 3. **assets/js/trade.js**

- Core trading logic and functionality
- Fetches live price data from LiveCoinWatch API
- Fetches order book data from Binance API
- TradingView chart integration
- Position management with local storage
- Risk calculations and liquidation price calculations

### 4. **Updated assets/js/script.js**

- Added click listeners to market overview cards
- Added click listeners to table rows
- Coins are now clickable and redirect to trading interface

## Features

### Trading Controls

- **Margin Type**: Cross Margin (high risk, use all balance) or Isolated (low risk, limit to position)
- **Leverage**: 1x to 125x with slider and ±/direct input
- **Order Direction**: Buy Long (profit if price ↑) or Sell Short (profit if price ↓)
- **Order Type**: Market Order, Limit Order, Stop Limit Order
- **Quantity Input**: Direct entry with USD value calculation
- **Percentage Slider**: Quick 25%, 50%, 75%, 100% allocation buttons

### Live Market Data

- **Live Price**: Real-time cryptocurrency prices from LiveCoinWatch API
- **24h Change**: Percentage change over last 24 hours
- **Order Book**: Real-time bid/ask prices and quantities from Binance API
- **TradingView Chart**: Professional interactive charts with indicators

### Position Management

- **Open Positions Tab**: View all open positions with:
  - Current P&L (Profit/Loss) in USD and percentage
  - Entry price vs current price
  - Leverage used
  - Liquidation price
  - Margin used
  - Close position button

- **Open Orders Tab**: Manage pending orders with full details

- **Order Book Tab**: Real-time order book display showing:
  - Bid prices (green) with quantities
  - Ask prices (red) with quantities
  - Middle market price
  - Total order values

### Risk Management

- **Entry Price**: The price at which you entered the position
- **Liquidation Price**: Calculated price at which position will be closed
- **Margin Required**: Amount of margin needed to open the position
- **P&L Calculation**: Real-time profit/loss based on current price

### Chart & Tabs

- **Perpetual/Delivery Tabs**: Switch between perpetual and delivery contracts
- **TradingView Integration**: Professional charting with:
  - Volume indicator
  - RSI indicator
  - Multiple timeframes
  - Full technical analysis tools

## How to Use

### 1. **Navigate to Trading Interface**

- Click any cryptocurrency card on the homepage (BTC, ETH, DOGE)
- Click any row in the market table
- You'll be redirected to: `trade.html?symbol=BTCUSDT` (or other coin)

### 2. **Select Trading Parameters**

- Choose Margin Type (Cross/Isolated)
- Set Leverage (1-125x)
- Choose Order Direction (Long/Short)
- Select Order Type (Market/Limit/Stop Limit)

### 3. **Enter Amount**

- Type quantity manually OR
- Use percentage buttons (25/50/75/100)
- Use percentage slider to adjust
- View USD equivalent value

### 4. **Review and Place Order**

- Check Entry Price, Liquidation Price, Margin Required
- Click "Place Order"
- Confirm in modal dialog
- Order is placed and appears in Positions tab

### 5. **Monitor Positions**

- Switch to "Positions" tab to see all open trades
- View real-time P&L for each position
- Close any position with "Close Position" button

## API Integration

### LiveCoinWatch API

- Used for: Real-time cryptocurrency prices and 24h changes
- Endpoint: `https://api.livecoinwatch.com/coins/single`
- Authentication: API Key (x-api-key header)
- Update Interval: Every 3 seconds

### Binance API

- Used for: Order book data
- Endpoint: `https://api.binance.com/api/v3/depth`
- No authentication required (public endpoint)
- Depth Limit: 10 (top 10 bid/ask prices)

### TradingView Lightweight Charts

- Embedded widget for professional charting
- Automatic symbol mapping (BTCUSDT → BINANCE:BTCUSDT)
- Volume and RSI indicators included

## Data Storage

### Local Storage

All positions and orders are saved to browser's local storage:

- Key: `tradingData`
- Persists across page refreshes
- Format: JSON with positions and orders arrays
- Data structure includes all position details (entry price, leverage, P&L, etc.)

## URL Parameters

The trading interface is fully dynamic based on URL parameters:

- `trade.html?symbol=BTCUSDT` - Bitcoin USDT pair
- `trade.html?symbol=ETHUSDT` - Ethereum USDT pair
- `trade.html?symbol=BNBUSDT` - Binance Coin USDT pair
- Any other USDT pair supported by Binance

## Responsive Design

- Desktop: 2-column layout (chart left, trading panel right)
- Tablet/Mobile: Single column (chart top, trading panel bottom)
- All controls are touch-friendly
- Sliders, buttons, and inputs work on mobile

## Styling

### Color Scheme

- Primary (Blue): `#0066ff`
- Success (Green): `#00b84d`
- Danger (Red): `#ff4444`
- Warning (Orange): `#ffa500`
- Background Primary: `#0f1419`
- Background Secondary: `#1a1e27`
- Text Primary: `#ffffff`

### Dark Theme

- Complete dark mode implementation
- Reduces eye strain
- Professional appearance
- Custom scrollbars

## Notifications

- Success: "Order placed successfully!"
- Error: Display error messages with details
- Warning: Low balance, invalid inputs
- Info: General notifications

## Risk Calculations

### Liquidation Price Formula

- **For Long Positions**: `Liquidation Price = Entry Price - (Entry Price / Leverage)`
- **For Short Positions**: `Liquidation Price = Entry Price + (Entry Price / Leverage)`
- Updates in real-time as leverage changes

### P&L Calculation

- **Long**: `(Current Price - Entry Price) × Quantity`
- **Short**: `(Entry Price - Current Price) × Quantity`
- Percentage: `(P&L / (Entry Price × Quantity)) × 100%`

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full responsive support

## Future Enhancements

Potential additions to the trading interface:

1. Stop Loss and Take Profit orders
2. Advanced order types (OCO, Trailing Stop)
3. Position history and trading statistics
4. Account balance and margin level display
5. Real-time trade execution (if connected to real trading API)
6. Multiple timeframe analysis
7. Trading signals and alerts
8. Portfolio management
9. Advanced charting tools
10. Mobile app version

## Troubleshooting

### Chart not loading?

- Check internet connection
- Ensure TradingView CDN is accessible
- Clear browser cache and reload

### Prices not updating?

- Check if API is responding
- Browser may have blocked API requests
- Check browser console for errors

### Positions not saving?

- Check if local storage is enabled
- Check browser privacy settings
- Ensure not in private/incognito mode

### Order placement failing?

- Verify all required fields are filled
- Check quantity is a valid number
- For limit orders, ensure price is entered

## Support

For issues or questions about the trading interface, check:

1. Browser console for error messages
2. Network tab in developer tools for API failures
3. Local storage in developer tools for data persistence

## API Rate Limits

- LiveCoinWatch: Check your API plan limits
- Binance: Public endpoints have rate limits (1200 requests per minute)
- Implementation includes 3-second update intervals to avoid rate limits

## Security Notes

1. API keys in frontend code: Not recommended for production
2. Move API keys to backend for production environment
3. Implement proper authentication
4. Add SSL/HTTPS for production
5. Validate all user inputs on backend
6. Consider using WebSockets for real-time data

## License

Part of CoinSwitch platform. All rights reserved.

---

**Last Updated**: May 8, 2026
**Version**: 1.0.0
