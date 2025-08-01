# VICE Logger
**Neural Surveillance Protocol v1.0.0-ALPHA**

A cyberpunk-themed Discord surveillance and AI possession application built with React Native and Expo. VICE Logger provides comprehensive monitoring, archival, and AI-powered response capabilities for Discord servers.

⚠️ **LEGAL DISCLAIMER**: This application operates in legal gray areas. Users are responsible for ensuring compliance with local laws, Discord's Terms of Service, and applicable privacy regulations. Use responsibly and ethically.

## 🎯 Core Features

- **Real-time Discord Surveillance** - Monitor messages, voice, edits, and deletions
- **AI Neural Hijack** - Automated response generation with customizable personas
- **Offline Archive Replay** - Import and replay Discord server exports
- **Advanced Plugin System** - Extensible preprocessing and response filtering
- **Multi-Backend AI Support** - OpenAI, Anthropic, local models, and custom APIs
- **Encrypted Token Vault** - Secure storage for Discord tokens and API keys
- **Comprehensive Audit Logging** - Track all system activities and security events

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Configure Discord Bot**
   - Create a Discord application at https://discord.com/developers/applications
   - Generate a bot token
   - Add the token to the secure vault (Config → Token Vault)

4. **Set Up AI Backend**
   - Configure OpenAI, Anthropic, or local AI model
   - Test connection and set as active backend

5. **Begin Surveillance**
   - Connect to Discord servers
   - Configure triggers and personas
   - Activate neural hijack mode

## 📱 Application Structure

### 🔍 Feed (Surveillance Monitor)
**Real-time monitoring dashboard for intercepted communications**

#### Features:
- **Live Message Stream** - Real-time display of intercepted Discord messages
- **Message Type Classification** - Visual indicators for text, voice, edits, and deletions
- **Server/Channel Context** - Shows origin server and channel for each message
- **Activity Statistics** - Live counters for messages, images, and voice transcriptions
- **Glitch Effects** - Cyberpunk visual effects with scanlines and interference

#### How It Works:
1. **WebSocket Connection** - Connects to Discord Gateway API using bot token
2. **Message Filtering** - Processes incoming messages based on configured channels
3. **Real-time Display** - Shows messages with animated entry effects
4. **Type Detection** - Automatically categorizes message types (text/voice/edit/delete)
5. **Metadata Extraction** - Captures author, timestamp, channel, and server information

#### Usage:
- Monitor the feed for suspicious activity or interesting conversations
- Use the live statistics to gauge server activity levels
- Messages appear with color-coded type indicators for quick identification

---

### 🖥️ Servers (Server Matrix)
**Discord server connection and channel monitoring management**

#### Features:
- **Bot Token Injection** - Secure input field for Discord bot tokens
- **Server Connection Status** - Visual indicators showing connection health
- **Channel Monitoring Controls** - Individual toggles for text and voice channels
- **Real-time Connection Health** - Live status updates and error reporting
- **Multi-server Support** - Connect to multiple Discord servers simultaneously

#### How It Works:
1. **Token Authentication** - Uses Discord bot token to authenticate with API
2. **Server Discovery** - Automatically discovers servers the bot has access to
3. **Channel Enumeration** - Lists all text and voice channels in each server
4. **Monitoring Configuration** - Allows selective monitoring of specific channels
5. **Connection Management** - Handles reconnection and error recovery

#### Usage:
1. **Add Bot Token** - Paste your Discord bot token in the injection field
2. **Select Servers** - Choose which servers to monitor from the connected list
3. **Configure Channels** - Toggle monitoring for specific channels (text/voice)
4. **Monitor Status** - Watch connection indicators for health status

---

### 📊 Logs (System Activity)
**System activity monitoring and data management**

#### Features:
- **Activity Timeline** - Chronological log of all system events
- **Event Classification** - Color-coded status indicators (success/warning/error)
- **Export Controls** - Download surveillance data in various formats
- **Data Purge Options** - Secure deletion of stored surveillance data
- **Storage Statistics** - Overview of captured messages, images, and voice data

#### How It Works:
1. **Event Logging** - Automatically logs all system activities and API interactions
2. **Status Tracking** - Monitors success/failure of operations with detailed error reporting
3. **Data Aggregation** - Compiles statistics on surveillance activities
4. **Export Generation** - Creates downloadable archives of collected data
5. **Secure Deletion** - Implements secure data wiping for privacy compliance

#### Usage:
- **Monitor System Health** - Check for errors or rate limiting issues
- **Export Data** - Download surveillance archives for external analysis
- **Manage Storage** - Purge old data to maintain system performance
- **Audit Activities** - Review system operations for security compliance

---

### 🧠 Hijack (Neural Possession)
**AI-powered automated response generation and sending**

#### Features:
- **Neural Link Activation** - Toggle AI possession mode on/off
- **Real-time Prompt Preview** - See exactly what prompt will be sent to AI
- **Response Generation** - AI-powered message creation using active persona
- **Response Editing** - Manual editing of AI responses before sending
- **Possession Effects** - Visual feedback during AI generation process
- **System Status Grid** - Overview of triggers, personas, modifiers, and response count

#### How It Works:
1. **Trigger Detection** - Monitors incoming messages for configured trigger conditions
2. **Prompt Construction** - Builds AI prompts using active persona and modifiers
3. **AI Generation** - Sends prompts to configured AI backend for response generation
4. **Response Processing** - Applies post-processing filters and modifications
5. **Message Sending** - Automatically sends responses through Discord API

#### Usage:
1. **Activate Neural Link** - Toggle the possession button to enable AI responses
2. **Monitor Prompts** - Review generated prompts in the preview area
3. **Edit Responses** - Modify AI-generated responses before sending
4. **Send Messages** - Use the send button to post responses to Discord
5. **Track Activity** - Monitor the status grid for possession statistics

---

### ⚙️ Config (Neural Configuration)
**Comprehensive system configuration and management hub**

#### AI Control Section:
- **Active Backend Display** - Shows currently selected AI model and configuration
- **Trigger Management** - Configure mention and keyword triggers
- **Persona Selection** - Choose and edit AI personality profiles
- **Quick Status Overview** - At-a-glance system health indicators

#### Plugin System Section:
- **Plugin Overview** - Shows first 3 active plugins with category badges
- **Plugin Editor** - Full-featured code editor for custom plugin development
- **Template Library** - Pre-built plugin templates for common use cases
- **Plugin Testing** - Sandbox environment for testing plugin code
- **Import/Export** - Share plugin configurations between installations

#### AI Backends Section:
- **Backend Management** - Add, edit, and configure AI service providers
- **Connection Testing** - Test API endpoints and measure latency
- **Local Model Presets** - Quick setup for Ollama, LM Studio, etc.
- **Active Backend Selection** - Choose which AI service to use for generation

#### Offline Archives Section:
- **Archive Import** - Load Discord server export files for offline analysis
- **Replay Sessions** - Create and manage message replay sessions
- **Session Statistics** - Track replay progress and generated responses

#### Behavior Modifiers Section:
- **Modifier Grid** - Toggle personality modifiers (Noir, Cynical, Cryptic, etc.)
- **Style Controls** - Adjust AI response style and tone
- **Quick Toggles** - Enable/disable modifiers with visual feedback

#### Token Vault Section:
- **Secure Token Storage** - Encrypted storage for Discord tokens and API keys
- **Vault Management** - Create, unlock, and manage multiple token vaults
- **Token Organization** - Categorize tokens by type (Discord, OpenAI, etc.)
- **Security Audit** - View access logs and security events
- **Auto-lock Protection** - Automatic vault locking after inactivity

#### How It Works:
1. **Centralized Configuration** - Single page for all system settings
2. **Real-time Updates** - Changes take effect immediately
3. **Security Integration** - All sensitive operations require vault unlock
4. **Plugin Sandboxing** - Safe execution environment for custom code
5. **Backend Abstraction** - Unified interface for different AI providers

#### Usage:
1. **Configure AI** - Set up AI backends and test connections
2. **Manage Plugins** - Install, edit, and test custom functionality
3. **Import Archives** - Load Discord exports for offline analysis
4. **Secure Tokens** - Store sensitive credentials in encrypted vaults
5. **Customize Behavior** - Adjust AI personality and response style

---

### ⚙️ Settings (System Configuration)
**Application settings and system preferences**

#### Interface Settings:
- **Glitch Mode** - Enable/disable cyberpunk visual effects
- **Theme Controls** - Adjust visual intensity and color schemes
- **Animation Settings** - Control transition speeds and effects

#### Surveillance Settings:
- **Auto Transcribe** - Automatically convert voice messages to text
- **Delete Capture** - Archive deleted messages and files before they disappear
- **Monitoring Scope** - Configure which message types to capture

#### Audio System:
- **Soundscape Control** - Enable cyberpunk audio effects and ambient sounds
- **Category Toggles** - Control ambient, message blips, possession sounds, and system sounds
- **Volume Management** - Adjust audio levels for different effect categories

#### Data Storage:
- **Export Controls** - Download surveillance archives
- **Encryption Options** - Encrypt local data storage
- **Storage Management** - Monitor disk usage and cleanup options

#### Danger Zone:
- **Data Purge** - Permanently delete all surveillance data
- **System Reset** - Return application to factory defaults
- **Security Warnings** - Legal and ethical usage reminders

#### How It Works:
1. **Persistent Settings** - All preferences saved to local storage
2. **Real-time Audio** - Audio system responds immediately to changes
3. **Security Integration** - Sensitive operations require confirmation
4. **Platform Adaptation** - Settings adjust based on web/mobile platform
5. **Legal Compliance** - Built-in warnings about responsible usage

#### Usage:
1. **Customize Interface** - Adjust visual effects to your preference
2. **Configure Surveillance** - Set up monitoring scope and transcription
3. **Manage Audio** - Control cyberpunk soundscape and effects
4. **Handle Data** - Export archives or purge sensitive information
5. **Review Warnings** - Understand legal implications of surveillance

---

## 🔧 Technical Architecture

### Core Technologies:
- **React Native** - Cross-platform mobile framework
- **Expo Router** - File-based navigation system
- **TypeScript** - Type-safe development
- **React Native Reanimated** - High-performance animations
- **Expo Linear Gradient** - Cyberpunk visual effects
- **Lucide React Native** - Consistent icon system

### Key Hooks:
- `useFrameworkReady` - Framework initialization
- `useAIGeneration` - AI response generation
- `useDiscordWebSocket` - Discord API connection
- `useSoundscape` - Audio effects system
- `useOfflineMode` - Archive replay functionality
- `usePluginLoader` - Plugin system management
- `useAIBackends` - AI service provider management
- `useTokenVault` - Encrypted credential storage

### Security Features:
- **Token Encryption** - AES-256-GCM encryption for stored credentials
- **Audit Logging** - Comprehensive security event tracking
- **Auto-lock** - Automatic vault locking after inactivity
- **Rate Limiting** - Protection against brute force attacks
- **Secure Export** - Token redaction in exported configurations

## 🎨 Design Philosophy

VICE Logger embraces a **cyberpunk aesthetic** with:
- **Neon Color Palette** - Cyan (#00FFF7), Magenta (#FF2EC0), Amber (#FFB000)
- **Monospace Typography** - JetBrains Mono for that terminal feel
- **Glitch Effects** - Subtle visual interference and scanlines
- **Grid Overlays** - Surveillance-inspired background patterns
- **Animated Feedback** - Smooth transitions and micro-interactions

## 🔒 Security Considerations

### Legal Compliance:
- **Terms of Service** - Ensure Discord ToS compliance
- **Privacy Laws** - Respect GDPR, CCPA, and local privacy regulations
- **Consent Requirements** - Obtain proper consent for surveillance activities
- **Data Retention** - Implement appropriate data retention policies

### Technical Security:
- **Token Protection** - Never log or expose Discord tokens
- **Encrypted Storage** - All sensitive data encrypted at rest
- **Secure Communication** - HTTPS/WSS for all API communications
- **Access Control** - Password-protected access to sensitive features

### Ethical Usage:
- **Transparency** - Inform users when surveillance is active
- **Proportionality** - Only collect data necessary for legitimate purposes
- **Accountability** - Maintain audit logs for all surveillance activities
- **Responsibility** - Use surveillance capabilities ethically and legally

## 🚀 Deployment

### Development:
```bash
npm run dev
```

### Production Build:
```bash
npm run build:web
```

### Platform Support:
- **Web** - Full functionality in modern browsers
- **iOS** - Native app with platform-specific optimizations
- **Android** - Native app with material design adaptations

## 🔮 Future Enhancements

- **Machine Learning** - Advanced pattern recognition in surveillance data
- **Multi-platform Support** - Telegram, Slack, and other messaging platforms
- **Advanced Analytics** - Sentiment analysis and conversation insights
- **Team Collaboration** - Multi-user surveillance operations
- **API Integration** - RESTful API for external tool integration

## 📄 License

This project is for educational and research purposes only. Users are responsible for ensuring compliance with all applicable laws and terms of service.

---

**Built with ⚡ by the VICE Logger Team**
*"Every message leaves a trace in the machine."*