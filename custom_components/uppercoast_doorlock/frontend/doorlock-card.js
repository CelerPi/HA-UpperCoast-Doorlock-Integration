import { LitElement, html, css } from 'https://esm.sh/lit@3.1.4';

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'doorlock-card',
  name: '云海湾门禁',
  description: '云海湾虚拟门禁系统 Dashboard 卡片',
  preview: true,
});

let ICON_URL = '';
try {
  ICON_URL = new URL('assets/icon.png', import.meta.url).href;
} catch (e) {
  ICON_URL = '';
}

class DoorlockCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object, state: true },
      _config: { type: Object, state: true },
      _callActive: { type: Boolean, state: true },
      _callAnswered: { type: Boolean, state: true },
      _callPopupDismissed: { type: Boolean, state: true },
      _callMinimized: { type: Boolean, state: true },
      _displayName: { type: String, state: true },
      _targetIp: { type: String, state: true },
      _floorLabel: { type: String, state: true },
      _positionDetail: { type: String, state: true },
      _showCallPopup: { type: Boolean, state: true },
      _showIntercomPopup: { type: Boolean, state: true },
      _showCallHistory: { type: Boolean, state: true },
      _showMonitorSelector: { type: Boolean, state: true },
      _showMonitorVideo: { type: Boolean, state: true },
      _monitorTargetIp: { type: String, state: true },
      _devices: { type: Array, state: true },
      _buildingName: { type: String, state: true },
      _dialInput: { type: String, state: true },
      _callHistory: { type: Array, state: true },
      _cameraUrl: { type: String, state: true },
      _entityMissing: { type: Boolean, state: true },
      _connectionStatus: { type: String, state: true },
      _deviceCount: { type: Number, state: true },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        --vds-bg: #000000;
        --vds-surface: rgba(14, 18, 32, 0.86);
        --vds-surface-strong: rgba(19, 25, 43, 0.94);
        --vds-glass: rgba(255, 255, 255, 0.07);
        --vds-glass-hover: rgba(255, 255, 255, 0.11);
        --vds-border: rgba(255, 255, 255, 0.11);
        --vds-border-hover: rgba(255, 255, 255, 0.2);
        --vds-text-primary: rgba(255, 255, 255, 0.94);
        --vds-text-secondary: rgba(226, 232, 240, 0.66);
        --vds-text-tertiary: rgba(203, 213, 225, 0.42);
        --vds-blue: #38BDF8;
        --vds-green: #34D399;
        --vds-red: #FB7185;
        --vds-orange: #FBBF24;
        --vds-yellow: #FDE68A;
      }

      /* Card */
      .card {
        position: relative;
        background:
          radial-gradient(circle at 14% 0%, rgba(52, 211, 153, 0.18), transparent 32%),
          linear-gradient(150deg, rgba(16, 23, 42, 0.96), rgba(11, 16, 31, 0.88));
        backdrop-filter: blur(28px) saturate(150%);
        -webkit-backdrop-filter: blur(28px) saturate(150%);
        border: 1px solid var(--vds-border);
        border-radius: 18px;
        overflow: hidden;
        color: var(--vds-text-primary);
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255,255,255,0.08);
      }

      /* Header */
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        padding: 16px 18px 12px;
        border-bottom: 1px solid var(--vds-border);
      }
      .card-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .card-title-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #34D399, #22C55E);
        border-radius: 11px;
        position: relative;
        overflow: hidden;
        font-size: 13px;
        font-weight: 700;
        color: rgba(6, 20, 14, 0.9);
        box-shadow: 0 10px 24px rgba(34, 197, 94, 0.26);
      }
      .card-title-icon span {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      .card-title-icon img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 2;
        border-radius: 12px;
      }
      .card-title-text {
        font-size: 16px;
        font-weight: 700;
        color: var(--vds-text-primary);
      }
      .card-title-sub {
        font-size: 12px;
        color: var(--vds-text-secondary);
        margin-top: 2px;
        font-weight: 400;
      }
      .status-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 11px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 650;
        background: rgba(148, 163, 184, 0.12);
        border: 1px solid var(--vds-border);
        color: var(--vds-text-secondary);
        white-space: nowrap;
      }
      .status-badge.active {
        background: rgba(251, 113, 133, 0.14);
        border-color: rgba(251, 113, 133, 0.28);
        color: var(--vds-red);
      }
      .status-badge.online,
      .status-badge.answered {
        background: rgba(52, 211, 153, 0.14);
        border-color: rgba(52, 211, 153, 0.28);
        color: var(--vds-green);
      }
      .status-badge.offline {
        background: rgba(251, 191, 36, 0.14);
        border-color: rgba(251, 191, 36, 0.28);
        color: var(--vds-orange);
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--vds-text-tertiary);
      }
      .status-badge.active .status-dot {
        background: var(--vds-red);
        animation: pulse 1.6s ease-in-out infinite;
      }
      .status-badge.online .status-dot,
      .status-badge.answered .status-dot {
        background: var(--vds-green);
      }
      .status-badge.offline .status-dot {
        background: var(--vds-orange);
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      /* Main buttons */
      .main-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 14px 16px 16px;
      }
      .main-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        min-width: 0;
        padding: 13px 12px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.095), rgba(255, 255, 255, 0.045));
        border: 1px solid var(--vds-border);
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1);
        font-family: inherit;
        color: var(--vds-text-primary);
        min-height: 62px;
      }
      .main-btn:hover {
        background: var(--vds-glass-hover);
        border-color: var(--vds-border-hover);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .main-btn:active {
        transform: translateY(1px) scale(0.99);
        background: rgba(120, 120, 128, 0.10);
      }
      .main-btn-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: rgba(56, 189, 248, 0.14);
        color: var(--vds-blue);
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .main-btn-icon ha-icon {
        --mdc-icon-size: 19px;
      }
      .main-btn.monitor .main-btn-icon {
        background: rgba(52, 211, 153, 0.14);
        color: var(--vds-green);
      }
      .main-btn.unlock .main-btn-icon {
        background: rgba(52, 211, 153, 0.14);
        color: var(--vds-green);
      }
      .main-btn.hangup .main-btn-icon {
        background: rgba(251, 113, 133, 0.14);
        color: var(--vds-red);
      }
      .main-btn-copy {
        min-width: 0;
        text-align: left;
      }
      .main-btn-label {
        display: block;
        font-size: 15px;
        font-weight: 700;
        color: var(--vds-text-primary);
        line-height: 1.15;
      }
      .main-btn-sub {
        display: block;
        margin-top: 3px;
        font-size: 11px;
        color: var(--vds-text-tertiary);
        line-height: 1.2;
      }
      .card-footer {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 0 18px 15px;
        color: var(--vds-text-tertiary);
        font-size: 11px;
      }
      .card-footer span {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        white-space: nowrap;
      }
      .card-footer strong {
        color: var(--vds-text-secondary);
        font-weight: 650;
        margin-left: 4px;
      }
      @media (max-width: 420px) {
        .card-header {
          padding: 14px 14px 10px;
        }
        .main-buttons {
          padding: 12px 12px 14px;
        }
        .main-btn {
          padding: 12px 10px;
        }
        .main-btn-sub {
          display: none;
        }
        .card-footer {
          padding: 0 14px 14px;
        }
      }

      /* Page content */
      .page-content {
        padding: 0 0 16px;
      }

      /* Entity missing */
      .entity-missing {
        padding: 28px 20px;
        text-align: center;
        color: var(--vds-text-secondary);
      }
      .entity-missing-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--vds-orange);
        margin-bottom: 6px;
      }
      .entity-missing-desc {
        font-size: 13px;
        color: var(--vds-text-secondary);
        margin-bottom: 16px;
      }
      .entity-missing-desc code {
        background: var(--vds-glass);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        color: var(--vds-text-primary);
      }
      .entity-missing-steps {
        text-align: left;
        background: var(--vds-glass);
        border: 1px solid var(--vds-border);
        border-radius: 14px;
        padding: 14px 16px;
        font-size: 12px;
        line-height: 1.8;
        color: var(--vds-text-secondary);
      }

      /* Dial pad */
      .dial-display {
        padding: 20px 20px 12px;
        text-align: center;
        font-size: 32px;
        font-weight: 300;
        color: var(--vds-text-primary);
        min-height: 48px;
        letter-spacing: 6px;
        font-variant-numeric: tabular-nums;
      }
      .intercom-dial-pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        padding: 0 16px 14px;
      }
      .intercom-dial-key {
        aspect-ratio: 1.5;
        background: transparent;
        border: 1px solid var(--vds-border);
        border-radius: 14px;
        color: var(--vds-text-primary);
        font-size: 22px;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        padding: 0;
      }
      .intercom-dial-key:hover {
        background: var(--vds-glass-hover);
        border-color: var(--vds-border-hover);
      }
      .intercom-dial-key:active {
        background: var(--vds-glass);
        transform: scale(0.96);
      }
      .intercom-dial-key.backspace {
        font-size: 15px;
        color: var(--vds-text-secondary);
        font-weight: 500;
      }
      .intercom-dial-key.property-center {
        font-size: 13px;
        font-weight: 500;
        color: var(--vds-text-secondary);
      }
      .dial-actions {
        padding: 0 16px 14px;
      }
      .dial-call-btn {
        width: 100%;
        padding: 16px;
        background: var(--vds-green);
        border: none;
        border-radius: 14px;
        color: #000;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
        letter-spacing: 0.5px;
      }
      .dial-call-btn:hover {
        background: #4CDF7A;
      }
      .dial-call-btn:active {
        transform: scale(0.97);
        background: #28B94F;
      }

      /* History toggle */
      .history-toggle {
        margin: 0 16px 12px;
        padding: 12px;
        background: var(--vds-glass);
        border: 1px solid var(--vds-border);
        border-radius: 14px;
        color: var(--vds-text-secondary);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: inherit;
        transition: all 0.15s;
      }
      .history-toggle:hover {
        background: var(--vds-glass-hover);
        color: var(--vds-text-primary);
      }

      /* Recent calls */
      .recent-calls {
        margin-top: 4px;
        padding: 0 16px;
      }
      .recent-calls-title {
        font-size: 11px;
        text-transform: uppercase;
        color: var(--vds-text-tertiary);
        margin-bottom: 10px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .call-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        background: var(--vds-glass);
        border: 1px solid var(--vds-border);
        border-radius: 14px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .call-item:hover {
        background: var(--vds-glass-hover);
      }
      .call-item-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .call-item-indicator.incoming { background: var(--vds-blue); }
      .call-item-indicator.outgoing { background: var(--vds-green); }
      .call-item-indicator.missed { background: var(--vds-red); }
      .call-item-info {
        flex: 1;
        min-width: 0;
      }
      .call-item-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--vds-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .call-item-time {
        font-size: 11px;
        color: var(--vds-text-tertiary);
        margin-top: 2px;
      }
      .call-item-redial {
        padding: 6px 14px;
        border-radius: 100px;
        background: var(--vds-glass);
        border: 1px solid var(--vds-border);
        color: var(--vds-green);
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        transition: all 0.15s;
      }
      .call-item-redial:hover {
        background: rgba(48, 209, 88, 0.15);
        border-color: rgba(48, 209, 88, 0.3);
      }

      /* Door grid */
      .door-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        padding: 16px;
      }
      @media (max-width: 500px) {
        .door-grid { grid-template-columns: repeat(2, 1fr); }
      }

      /* Door item */
      .door-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px 8px;
        background: var(--vds-glass);
        border: 1px solid var(--vds-border);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1);
        gap: 6px;
        min-height: 90px;
      }
      .door-btn:hover {
        background: var(--vds-glass-hover);
        border-color: var(--vds-border-hover);
      }
      .door-btn:active {
        transform: scale(0.96);
        background: rgba(120, 120, 128, 0.10);
      }
      .door-btn.current-call {
        background: rgba(255, 69, 58, 0.12);
        border-color: rgba(255, 69, 58, 0.3);
      }
      .door-btn-num {
        font-size: 20px;
        font-weight: 600;
        color: var(--vds-text-primary);
      }
      .door-btn-name {
        font-size: 11px;
        font-weight: 500;
        color: var(--vds-text-secondary);
      }
      .door-btn-floor {
        font-size: 10px;
        color: var(--vds-text-tertiary);
        text-align: center;
        line-height: 1.2;
      }
      .door-btn.offline {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .door-btn.offline:hover {
        transform: none;
        background: var(--vds-glass);
      }
      .door-btn-floor-strip {
        width: 100%;
        height: 2px;
        border-radius: 1px;
        margin-bottom: 4px;
      }
      .floor-1 { background: var(--vds-blue); }
      .floor-2 { background: #BF5AF2; }
      .floor-b1 { background: var(--vds-orange); }
      .floor-b2 { background: var(--vds-red); }

      /* Empty state */
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--vds-text-tertiary);
        font-size: 13px;
      }
      .empty-state-title {
        font-size: 15px;
        font-weight: 500;
        color: var(--vds-text-secondary);
        margin-bottom: 6px;
      }

      /* Popup overlay */
      .popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .popup {
        width: 100%;
        max-width: 400px;
        background: var(--vds-surface-strong);
        border: 1px solid var(--vds-border);
        border-radius: 18px;
        overflow: hidden;
        backdrop-filter: blur(34px) saturate(150%);
        -webkit-backdrop-filter: blur(34px) saturate(150%);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255,255,255,0.08);
        animation: popupIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
      }
      .popup.call-popup {
        max-width: min(640px, calc(100vw - 40px));
      }
      @keyframes popupIn {
        from { opacity: 0; transform: scale(0.92) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: rgba(255, 69, 58, 0.08);
        border-bottom: 1px solid rgba(255, 69, 58, 0.15);
      }
      .popup-header.answered {
        background: rgba(48, 209, 88, 0.08);
        border-bottom-color: rgba(48, 209, 88, 0.15);
      }
      .popup-header.intercom {
        background: rgba(10, 132, 255, 0.08);
        border-bottom-color: rgba(10, 132, 255, 0.15);
      }
      .popup-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .popup-calling-icon {
        width: 36px;
        height: 36px;
        background: rgba(255, 69, 58, 0.15);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        color: var(--vds-red);
        animation: pulse 1.6s ease-in-out infinite;
      }
      .popup-calling-icon.answered {
        background: rgba(48, 209, 88, 0.15);
        color: var(--vds-green);
        animation: none;
      }
      .popup-calling-label {
        font-size: 11px;
        color: var(--vds-red);
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .popup-calling-label.answered {
        color: var(--vds-green);
      }
      .popup-device-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--vds-text-primary);
        margin-top: 2px;
        letter-spacing: -0.2px;
      }
      .popup-device-location {
        font-size: 12px;
        color: var(--vds-text-tertiary);
        margin-top: 1px;
      }
      .popup-close {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--vds-glass);
        border: 1px solid var(--vds-border);
        color: var(--vds-text-secondary);
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
        font-weight: 300;
      }
      .popup-close:hover {
        background: var(--vds-glass-hover);
        color: var(--vds-text-primary);
      }

      /* Video frame */
      .video-frame {
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #000;
        position: relative;
        overflow: hidden;
      }
      .video-frame img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .call-popup .video-frame {
        aspect-ratio: 4 / 3;
      }
      .video-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--vds-text-tertiary);
        font-size: 13px;
        background: rgba(0, 0, 0, 0.4);
      }
      .video-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--vds-text-secondary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Action buttons */
      .popup-actions {
        display: flex;
        gap: 12px;
        padding: 14px 16px 16px;
      }
      .popup-actions.two-btn {
        gap: 12px;
      }
      .action-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 14px 8px;
        border-radius: 14px;
        border: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.15s;
        font-family: inherit;
        letter-spacing: -0.2px;
      }
      .action-btn:active {
        transform: scale(0.96);
      }
      .action-btn-label {
        font-size: 10px;
        font-weight: 500;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .action-btn.unlock {
        background: var(--vds-green);
        color: #000;
      }
      .action-btn.unlock:hover {
        background: #4CDF7A;
      }
      .action-btn.answer {
        background: var(--vds-blue);
        color: #fff;
      }
      .action-btn.answer:hover {
        background: #3395FF;
      }
      .action-btn.hangup {
        background: var(--vds-red);
        color: #fff;
      }
      .action-btn.hangup:hover {
        background: #FF5E54;
      }
      .action-btn.stop {
        background: var(--vds-red);
        color: #fff;
      }
      .action-btn.stop:hover {
        background: #FF5E54;
      }

      /* Call PiP (small window) */
      .call-pip {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 260px;
        background: rgba(28, 28, 30, 0.92);
        border: 1px solid var(--vds-border);
        border-radius: 18px;
        overflow: hidden;
        backdrop-filter: blur(40px) saturate(180%);
        -webkit-backdrop-filter: blur(40px) saturate(180%);
        box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
        z-index: 9000;
        cursor: default;
        animation: pipIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        transition: transform 0.2s ease;
      }
      .call-pip:hover {
        transform: scale(1.02);
      }
      .call-pip:active {
        transform: scale(0.98);
      }
      @keyframes pipIn {
        from { opacity: 0; transform: translateY(20px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .call-pip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: rgba(255, 69, 58, 0.1);
        border-bottom: 1px solid rgba(255, 69, 58, 0.15);
      }
      .call-pip-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        background: rgba(255, 69, 58, 0.2);
        color: var(--vds-red);
        letter-spacing: 0.3px;
      }
      .call-pip-badge.answered {
        background: rgba(48, 209, 88, 0.2);
        color: var(--vds-green);
      }
      .call-pip-name {
        flex: 1;
        font-size: 13px;
        font-weight: 600;
        color: var(--vds-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .call-pip-close {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--vds-glass);
        border: 1px solid var(--vds-border);
        color: var(--vds-text-secondary);
        font-size: 16px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
      }
      .call-pip-close:hover {
        background: var(--vds-glass-hover);
        color: var(--vds-text-primary);
      }
      .call-pip-video {
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #000;
        position: relative;
        overflow: hidden;
        cursor: zoom-in;
      }
      .call-pip-video img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .call-pip-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--vds-text-secondary);
        font-size: 12px;
      }
      .call-pip-actions {
        display: flex;
        gap: 8px;
        padding: 10px 12px 12px;
      }
      .call-pip-actions .action-btn {
        padding: 10px 4px;
        font-size: 12px;
      }

      /* Monitor popup */
      .monitor-popup {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 9000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .monitor-popup-content {
        width: 100%;
        max-width: 520px;
        background: rgba(28, 28, 30, 0.85);
        border: 1px solid var(--vds-border);
        border-radius: 24px;
        overflow: hidden;
        backdrop-filter: blur(50px) saturate(180%);
        -webkit-backdrop-filter: blur(50px) saturate(180%);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08);
        animation: popupIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
      }
      .monitor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        background: rgba(10, 132, 255, 0.08);
        border-bottom: 1px solid rgba(10, 132, 255, 0.15);
      }
      .monitor-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .monitor-icon {
        width: 34px;
        height: 34px;
        background: rgba(10, 132, 255, 0.12);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        color: var(--vds-blue);
      }
      .monitor-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--vds-text-primary);
        letter-spacing: -0.2px;
      }
      .monitor-subtitle {
        font-size: 12px;
        color: var(--vds-text-tertiary);
        margin-top: 1px;
      }
      .monitor-actions {
        display: flex;
        gap: 12px;
        padding: 14px 16px 16px;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    this._stopCameraRefresh();
    this._stopAudio();
    this._disconnectRealtime();
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    if (changedProperties.has('_showCallPopup') || changedProperties.has('_showMonitorVideo')) {
      if (this._showCallPopup || this._showMonitorVideo) {
        this._updateCameraImage();
        this._startCameraRefresh();
      } else {
        this._stopCameraRefresh();
      }
    }
  }

  setConfig(config) {
    this._config = config || {};
    this._entityId = this._config.entity || 'binary_sensor.vds_call_status';
    this._cameraEntityId = this._config.camera_entity || 'camera.vds_video';
    this._dialInput = '';
    this._callHistory = [];
    this._showCallHistory = false;
    this._callAnswered = false;
    this._callPopupDismissed = false;
    this._showIntercomPopup = false;
    this._showMonitorSelector = false;
    this._showMonitorVideo = false;
    this._entityMissing = false;
    this._connectionStatus = 'unknown';
    this._deviceCount = 0;
  }

  set hass(hass) {
    this._hass = hass;
    this._loadState();
    this._connectRealtime();
  }

  _loadState() {
    if (!this._hass) return;
    const entityId = this._entityId || 'binary_sensor.vds_call_status';
    const state = this._hass.states[entityId];
    if (!state) {
      console.warn('[DoorlockCard] 未找到实体:', entityId);
      this._entityMissing = true;
      return;
    }
    this._entityMissing = false;

    const a = state.attributes || {};
    const wasActive = this._callActive;

    this._callActive = state.state === 'on';

    if (this._callActive) {
      this._displayName = a.display_name || '';
      this._targetIp = a.target_ip || '';
      this._floorLabel = a.floor_label || '';
      this._positionDetail = a.position_detail || '';

      if (!wasActive) {
        // 新的呼入开始
        this._callAnswered = false;
        this._callPopupDismissed = false;
        this._callMinimized = true;
        this._showCallPopup = true;
        this._showMonitorSelector = false;
        this._showMonitorVideo = false;
        this._showIntercomPopup = false;
      } else if (!this._callPopupDismissed && !this._showMonitorSelector && !this._showMonitorVideo && !this._showIntercomPopup) {
        // 呼叫仍在进行，且用户没有手动关闭
        this._showCallPopup = true;
      }
    } else {
      // 呼叫结束
      if (wasActive && !this._callAnswered) {
        this._addToHistory({
          type: 'missed',
          name: this._displayName || '未知',
          number: '',
          time: new Date().toLocaleString('zh-CN'),
        });
      }
      this._callAnswered = false;
      this._callPopupDismissed = false;
      this._showCallPopup = false;
      this._stopAudio();
    }

    this._buildingName = a.building_name || '云海湾门禁';
    this._devices = a.devices || [];
    this._deviceCount = Number(a.device_count ?? this._devices.length ?? 0);
    this._connectionStatus = a.connection_status || 'unknown';

    // 调试日志：在浏览器开发者工具 Console 中查看
    console.debug('[DoorlockCard] 状态更新:', {
      connection: a.connection_status,
      apiUrl: a.api_url,
      deviceCount: a.device_count,
      devices: this._devices,
    });
  }

  /* =============== Camera / Video =============== */

  _connectRealtime() {
    if (!this._hass || this._wsConnecting || this._wsConnected || this._wsUnavailable) return;

    this._wsConnecting = true;
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const token = encodeURIComponent(this._getAuthToken());
    const url = `${scheme}://${window.location.host}/api/uppercoast_doorlock/ws?token=${token}`;
    const ws = new WebSocket(url);
    this._realtimeWs = ws;

    ws.onopen = () => {
      this._wsConnecting = false;
      this._wsConnected = true;
      this._wsUnavailable = false;
      this._stopCameraRefresh();
      if (this._audioPollInterval) {
        clearInterval(this._audioPollInterval);
        this._audioPollInterval = null;
      }
    };

    ws.onmessage = (event) => this._handleRealtimeMessage(event);
    ws.onerror = () => {
      this._wsUnavailable = true;
    };
    ws.onclose = () => {
      this._wsConnecting = false;
      this._wsConnected = false;
      if (!this._wsUnavailable && this.isConnected) {
        setTimeout(() => this._connectRealtime(), 3000);
      }
    };
  }

  _disconnectRealtime() {
    this._wsConnecting = false;
    this._wsConnected = false;
    if (this._realtimeWs) {
      this._realtimeWs.close();
      this._realtimeWs = null;
    }
  }

  _handleRealtimeMessage(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      return;
    }

    if (data.type === 'frame' && data.jpeg) {
      this._cameraUrl = `data:image/jpeg;base64,${data.jpeg}`;
      return;
    }

    if (data.type === 'audio' && data.pcm) {
      this._audioLastId = Math.max(this._audioLastId || 0, data.id || 0);
      this._queueAudio(data.pcm);
    }
  }

  _startCameraRefresh() {
    if (this._wsConnected) return;
    if (this._cameraInterval) return;
    this._cameraInterval = setInterval(() => this._updateCameraImage(), 500);
  }

  _stopCameraRefresh() {
    if (this._cameraInterval) {
      clearInterval(this._cameraInterval);
      this._cameraInterval = null;
    }
  }

  _updateCameraImage() {
    const cameraEntityId = this._cameraEntityId || 'camera.vds_video';
    const cameraState = this._hass?.states[cameraEntityId];
    if (!cameraState) {
      this._cameraUrl = '';
      return;
    }
    const entityPicture = cameraState.attributes.entity_picture;
    if (!entityPicture) {
      this._cameraUrl = '';
      return;
    }
    this._cameraUrl = entityPicture + (entityPicture.includes('?') ? '&' : '?') + '_t=' + Date.now();
  }

  /* =============== Audio =============== */

  _initAudio() {
    if (this._audioCtx) return;
    this._audioCtx = new AudioContext();
    this._audioQueue = [];
    this._audioProcessor = this._audioCtx.createScriptProcessor(256, 0, 1);
    this._audioProcessor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      if (this._audioQueue.length > 0) {
        const chunk = this._audioQueue.shift();
        const len = Math.min(output.length, chunk.length);
        for (let i = 0; i < len; i++) output[i] = chunk[i];
        for (let i = len; i < output.length; i++) output[i] = 0;
      } else {
        for (let i = 0; i < output.length; i++) output[i] = 0;
      }
    };
    this._audioProcessor.connect(this._audioCtx.destination);
  }

  _startAudio(targetIp) {
    if (!targetIp) return;
    this._stopAudio();
    this._initAudio();
    this._audioLastId = 0;
    this._audioQueue = [];
    this._startMicrophone(targetIp);
    if (!this._wsConnected) {
      this._audioPollInterval = setInterval(() => this._pollAudio(targetIp), 50);
    }
  }

  _stopAudio() {
    if (this._audioPollInterval) {
      clearInterval(this._audioPollInterval);
      this._audioPollInterval = null;
    }
    this._stopMicrophone();
    this._audioQueue = [];
  }

  async _pollAudio(targetIp) {
    if (!this._hass || !targetIp) return;
    const token = this._getAuthToken();
    if (!token) return;
    try {
      const resp = await fetch(`/api/uppercoast_doorlock/audio?since=${this._audioLastId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data.ok) return;
      if (data.chunks && data.chunks.length > 0) {
        for (const chunk of data.chunks) {
          this._audioLastId = Math.max(this._audioLastId, chunk.id);
          this._queueAudio(chunk.pcm);
        }
      }
    } catch (e) {
      // ignore network errors
    }
  }

  _queueAudio(base64Pcm) {
    try {
      const binary = atob(base64Pcm);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }
      this._audioQueue.push(float32);
    } catch (e) {
      console.error('[DoorlockCard] Audio decode error:', e);
    }
  }

  async _startMicrophone(targetIp) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this._micStream = stream;
      this._micCtx = new AudioContext();
      const source = this._micCtx.createMediaStreamSource(stream);
      this._micProcessor = this._micCtx.createScriptProcessor(4096, 1, 1);
      this._micProcessor.onaudioprocess = (e) => this._onAudioProcess(e, targetIp);
      source.connect(this._micProcessor);
      this._micProcessor.connect(this._micCtx.destination);
    } catch (e) {
      console.warn('[DoorlockCard] Microphone access denied:', e);
    }
  }

  _stopMicrophone() {
    if (this._micProcessor) {
      this._micProcessor.disconnect();
      this._micProcessor = null;
    }
    if (this._micStream) {
      this._micStream.getTracks().forEach((t) => t.stop());
      this._micStream = null;
    }
    if (this._micCtx) {
      this._micCtx.close();
      this._micCtx = null;
    }
  }

  _onAudioProcess(event, targetIp) {
    const input = event.inputBuffer.getChannelData(0);
    const sampleRate = this._micCtx.sampleRate;
    const ratio = sampleRate / 8000;
    const outputLength = Math.floor(input.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      output[i] = input[Math.floor(i * ratio)];
    }
    const int16 = new Int16Array(output.length);
    for (let i = 0; i < output.length; i++) {
      const s = Math.max(-1, Math.min(1, output[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const pcmBase64 = btoa(binary);
    this._sendAudioChunk(targetIp, pcmBase64);
  }

  async _sendAudioChunk(targetIp, pcmBase64) {
    if (this._wsConnected && this._realtimeWs?.readyState === WebSocket.OPEN) {
      this._realtimeWs.send(JSON.stringify({
        type: 'audio',
        target_ip: targetIp,
        pcm: pcmBase64,
      }));
      return;
    }

    const token = this._getAuthToken();
    if (!token || !targetIp) return;
    try {
      await fetch('/api/uppercoast_doorlock/audio', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target_ip: targetIp, pcm: pcmBase64 }),
      });
    } catch (e) {
      // ignore network errors
    }
  }

  _getAuthToken() {
    try {
      return this._hass.auth.data.access_token;
    } catch (e) {
      return '';
    }
  }

  /* =============== Helpers =============== */

  _getDoors() {
    return this._devices || [];
  }

  _getFloorColor(floorLabel) {
    if (!floorLabel) return 'floor-1';
    if (floorLabel.includes('1层') && !floorLabel.includes('-')) return 'floor-1';
    if (floorLabel.includes('2层')) return 'floor-2';
    if (floorLabel.includes('-1层')) return 'floor-b1';
    if (floorLabel.includes('-2层')) return 'floor-b2';
    return 'floor-1';
  }

  _getDoorStatus(targetIp) {
    if (!targetIp || !this._hass) return 'offline';
    const cameraEntityId = this._cameraEntityId || 'camera.vds_video';
    const cameraState = this._hass.states[cameraEntityId];
    if (!cameraState) return 'offline';
    if (this._targetIp === targetIp && this._callActive) return 'current-call';
    return 'online';
  }

  _callService(service, data = {}) {
    if (!this._hass) return;
    this._hass.callService('uppercoast_doorlock', service, data);
  }

  /* =============== Call Actions =============== */

  _answerCall() {
    this._callAnswered = true;
    this._callService('answer', { target_ip: this._targetIp });
    this._startAudio(this._targetIp);
  }

  _hangupCall() {
    this._callService('hangup', { target_ip: this._targetIp });
    this._callAnswered = false;
    this._stopAudio();
    this._addToHistory({
      type: 'incoming',
      name: this._displayName || '未知',
      number: '',
      time: new Date().toLocaleString('zh-CN'),
    });
    this._showCallPopup = false;
  }

  _unlockDoor() {
    if (!this._callActive) return;
    this._callService('unlock', { target_ip: this._targetIp });
  }

  _dismissCallPopup() {
    this._showCallPopup = false;
    this._callPopupDismissed = true;
    this._callMinimized = false;
  }

  _expandCallPopup() {
    this._callMinimized = false;
  }

  /* =============== Monitor Actions =============== */

  _openMonitorSelector() {
    this._showMonitorSelector = true;
    this._showMonitorVideo = false;
    this._showCallPopup = false;
    this._showIntercomPopup = false;
  }

  _startMonitor(targetIp) {
    this._monitorTargetIp = targetIp;
    this._showMonitorSelector = false;
    this._showMonitorVideo = true;
    this._callService('monitor_start', { target_ip: targetIp });
    this._startAudio(targetIp);
  }

  _stopMonitor() {
    this._stopAudio();
    if (this._monitorTargetIp) {
      this._callService('monitor_stop', { target_ip: this._monitorTargetIp });
    }
    this._showMonitorVideo = false;
    this._showMonitorSelector = true;
    this._monitorTargetIp = '';
  }

  /* =============== Dial Actions =============== */

  _dial(key) {
    if (this._dialInput.length >= 4) return;
    this._dialInput += key;
  }

  _dialBackspace() {
    this._dialInput = this._dialInput.slice(0, -1);
  }

  _dialClear() {
    this._dialInput = '';
  }

  _makeCall() {
    const number = this._dialInput.trim();
    if (!number) return;

    // TODO: 需要 Addon 提供 /api/dial 端点用于呼叫其他房号
    // this._callService('dial', { number: number });

    this._addToHistory({
      type: 'outgoing',
      name: `房号 ${number}`,
      number: number,
      time: new Date().toLocaleString('zh-CN'),
    });

    this._dialInput = '';
  }

  _callPropertyCenter() {
    // TODO: 需要 Addon 提供物业中心机呼叫端点
    // this._callService('dial', { target: 'property_center' });

    this._addToHistory({
      type: 'outgoing',
      name: '物业中心',
      number: '物业中心',
      time: new Date().toLocaleString('zh-CN'),
    });
  }

  _addToHistory(entry) {
    if (!this._callHistory) this._callHistory = [];
    this._callHistory = [entry, ...this._callHistory].slice(0, 50);
  }

  /* =============== Render =============== */

  render() {
    const buildingName = this._buildingName || '云海湾门禁';

    if (this._entityMissing) {
      return html`
        <div class="card">
          ${this._renderHeader(buildingName)}
          <div class="entity-missing">
            <div class="entity-missing-title">Integration 未就绪</div>
            <div class="entity-missing-desc">
              未找到实体 <code>binary_sensor.vds_call_status</code>
            </div>
            <div class="entity-missing-steps">
              <div>1. 确认 Addon 已启动且日志显示「已加载门口机」</div>
              <div>2. 在 <b>设置 → 设备与服务</b> 中添加「虚拟门禁系统」Integration</div>
              <div>3. Host 必须填 <b>HA 主机的实际 IP</b>（不能填 localhost）</div>
              <div>4. 配置完成后重载 Integration 或重启 HA</div>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="card">
        ${this._renderHeader(buildingName)}
        ${this._renderMainButtons()}
        ${this._renderFooter()}
      </div>
      ${this._showIntercomPopup ? this._renderIntercomPopup() : ''}
      ${this._showMonitorSelector ? this._renderMonitorSelector() : ''}
      ${this._showMonitorVideo ? this._renderMonitorVideoPopup() : ''}
      ${this._showCallPopup ? this._renderCallPopup() : ''}
    `;
  }

  _renderHeader(buildingName) {
    const isConnected = this._connectionStatus !== 'disconnected';
    const statusText = this._callActive
      ? (this._callAnswered ? '通话中' : '呼叫中')
      : (isConnected ? '在线' : '离线');
    const statusClass = this._callActive
      ? (this._callAnswered ? 'answered' : 'active')
      : (isConnected ? 'online' : 'offline');

    return html`
      <div class="card-header">
        <div class="card-title">
          <div class="card-title-icon">
            ${ICON_URL ? html`<img src="${ICON_URL}" alt="" @error=${(e) => { e.target.style.display='none'; }}>` : ''}
            <span>门禁</span>
          </div>
          <div>
            <div class="card-title-text">云海湾门禁</div>
            <div class="card-title-sub">${buildingName}</div>
          </div>
        </div>
        <div class="status-badge ${statusClass}">
          <div class="status-dot"></div>
          ${statusText}
        </div>
      </div>
    `;
  }

  _renderMainButtons() {
    if (this._callActive) {
      return html`
        <div class="main-buttons">
          <button class="main-btn unlock" @click=${this._unlockDoor}>
            <span class="main-btn-icon"><ha-icon icon="mdi:lock-open-outline"></ha-icon></span>
            <span class="main-btn-copy">
              <span class="main-btn-label">开锁</span>
              <span class="main-btn-sub">打开当前门口机</span>
            </span>
          </button>
          <button class="main-btn hangup" @click=${this._hangupCall}>
            <span class="main-btn-icon"><ha-icon icon="mdi:phone-hangup"></ha-icon></span>
            <span class="main-btn-copy">
              <span class="main-btn-label">挂断</span>
              <span class="main-btn-sub">${this._callAnswered ? '结束通话' : '拒绝呼叫'}</span>
            </span>
          </button>
        </div>
      `;
    }

    return html`
      <div class="main-buttons">
        <button class="main-btn" @click=${() => { this._showIntercomPopup = true; }}>
          <span class="main-btn-icon"><ha-icon icon="mdi:phone-in-talk-outline"></ha-icon></span>
          <span class="main-btn-copy">
            <span class="main-btn-label">对讲</span>
            <span class="main-btn-sub">拨号与通话</span>
          </span>
        </button>
        <button class="main-btn monitor" @click=${this._openMonitorSelector}>
          <span class="main-btn-icon"><ha-icon icon="mdi:cctv"></ha-icon></span>
          <span class="main-btn-copy">
            <span class="main-btn-label">监控</span>
            <span class="main-btn-sub">查看门口机</span>
          </span>
        </button>
      </div>
    `;
  }

  _renderFooter() {
    const count = this._deviceCount || (Array.isArray(this._devices) ? this._devices.length : 0);
    const activeText = this._callActive ? (this._displayName || '呼叫中') : '无活动呼叫';
    const connectionText = this._connectionStatus === 'disconnected' ? '后端未连接' : '后端已连接';

    return html`
      <div class="card-footer">
        <span>门口机 <strong>${count ? `${count} 台` : '—'}</strong></span>
        <span>${connectionText} · ${activeText}</span>
      </div>
    `;
  }

  /* =============== Intercom Popup =============== */

  _renderIntercomPopup() {
    const recentCalls = (this._callHistory || []).slice(0, 5);
    const typeMap = {
      incoming: '呼入',
      outgoing: '呼出',
      missed: '未接',
    };

    return html`
      <div class="popup-overlay" @click=${(e) => { if (e.target === e.currentTarget) this._showIntercomPopup = false; }}>
        <div class="popup call-popup">
          <div class="popup-header intercom">
            <div class="popup-header-info">
              <div class="popup-calling-icon" style="animation:none;background:rgba(96,165,250,0.2);color:var(--vds-blue);">对讲</div>
              <div>
                <div class="popup-device-name">对讲</div>
                <div class="popup-device-location">${this._buildingName || '云海湾门禁'}</div>
              </div>
            </div>
            <button class="popup-close" @click=${() => this._showIntercomPopup = false}>×</button>
          </div>

          <div class="page-content">
            <div class="dial-display">${this._dialInput || ' '}</div>
            <div class="intercom-dial-pad">
              ${['1','2','3','4','5','6','7','8','9'].map(key => html`
                <button class="intercom-dial-key" @click=${() => this._dial(key)}>${key}</button>
              `)}
              <button class="intercom-dial-key property-center" @click=${this._callPropertyCenter} title="物业中心机">物业</button>
              <button class="intercom-dial-key" @click=${() => this._dial('0')}>0</button>
              <button class="intercom-dial-key backspace" @click=${this._dialBackspace}>删除</button>
            </div>
            <div class="dial-actions">
              <button class="dial-call-btn" @click=${this._makeCall}>呼叫</button>
            </div>

            <button class="history-toggle" @click=${() => this._showCallHistory = !this._showCallHistory}>
              <span>${this._showCallHistory ? '▾' : '▸'}</span>
              ${this._showCallHistory ? '隐藏通话记录' : '显示通话记录'}
            </button>

            ${this._showCallHistory && recentCalls.length > 0 ? html`
              <div class="recent-calls">
                <div class="recent-calls-title">最近通话</div>
                ${recentCalls.map((call) => {
                  const cls = call.type || 'incoming';
                  const canRedial = call.number && call.number !== '物业中心';
                  return html`
                    <div class="call-item" @click=${() => {
                      if (canRedial) this._dialInput = call.number;
                    }}>
                      <div class="call-item-indicator ${cls}"></div>
                      <div class="call-item-info">
                        <div class="call-item-name">${call.name}</div>
                        <div class="call-item-time">${typeMap[call.type] || '呼入'} · ${call.time}</div>
                      </div>
                      ${canRedial ? html`
                        <button class="call-item-redial" @click=${(e) => {
                          e.stopPropagation();
                          this._dialInput = call.number;
                          this._makeCall();
                        }}>重拨</button>
                      ` : ''}
                    </div>
                  `;
                })}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* =============== Monitor Selector =============== */

  _renderMonitorSelector() {
    const doors = this._getDoors();

    return html`
      <div class="popup-overlay" @click=${(e) => { if (e.target === e.currentTarget) this._showMonitorSelector = false; }}>
        <div class="popup" style="max-width:520px;">
          <div class="monitor-header">
            <div class="monitor-header-info">
              <div class="monitor-icon">监控</div>
              <div>
                <div class="monitor-title">选择监控号机</div>
                <div class="monitor-subtitle">${this._buildingName || '云海湾门禁'}</div>
              </div>
            </div>
            <button class="popup-close" @click=${() => this._showMonitorSelector = false}>×</button>
          </div>

          ${!doors.length ? html`
            <div class="empty-state">
              <div class="empty-state-title">暂无门口机数据</div>
              <div style="font-size:11px;margin-top:8px;line-height:1.6;">
                1. 确认 Addon 已启动<br/>
                2. 检查 Integration 配置的 host/port 是否正确<br/>
                3. 在浏览器 F12 → Console 查看调试信息
              </div>
            </div>
          ` : html`
            <div class="door-grid">
              ${doors.map((door) => {
                const status = this._getDoorStatus(door.target_ip);
                const isCurrentCall = status === 'current-call';
                const displayName = door.display_name || door.name || '';
                return html`
                  <div
                    class="door-btn ${status === 'offline' ? 'offline' : ''} ${isCurrentCall ? 'current-call' : ''}"
                    @click=${() => { if (status !== 'offline') this._startMonitor(door.target_ip); }}
                  >
                    <div class="door-btn-floor-strip ${this._getFloorColor(door.floor_label)}"></div>
                    <div class="door-btn-num">${displayName}</div>
                    <div class="door-btn-floor">${door.floor_label || ''}</div>
                  </div>
                `;
              })}
            </div>
          `}
        </div>
      </div>
    `;
  }



  /* =============== Call Popup =============== */

  _renderCallPopup() {
    const answerBtn = this._callAnswered
      ? html`
        <button class="action-btn hangup" @click=${this._hangupCall}>
          挂断
        </button>`
      : html`
        <button class="action-btn answer" @click=${this._answerCall}>
          接听
        </button>`;

    const headerClass = this._callAnswered ? 'answered' : '';
    const iconClass = this._callAnswered ? 'answered' : '';
    const labelClass = this._callAnswered ? 'answered' : '';
    const labelText = this._callAnswered ? '通话中' : '呼入中';

    // 小窗模式（右下角画中画）
    if (this._callMinimized) {
      return html`
        <div class="call-pip">
          <div class="call-pip-header">
            <span class="call-pip-badge ${iconClass}">${labelText}</span>
            <span class="call-pip-name">${this._displayName}</span>
            <button class="call-pip-close" @click=${(e) => { e.stopPropagation(); this._dismissCallPopup(); }}>×</button>
          </div>
          <div class="call-pip-video" @click=${this._expandCallPopup} title="点击放大">
            ${this._cameraUrl
              ? html`<img src="${this._cameraUrl}" alt="门禁视频" />`
              : html`<div class="call-pip-placeholder">加载中...</div>`}
          </div>
          <div class="call-pip-actions">
            <button class="action-btn unlock" @click=${(e) => { e.stopPropagation(); this._unlockDoor(); }}>
              解锁
            </button>
            ${this._callAnswered
              ? html`
                <button class="action-btn hangup" @click=${(e) => { e.stopPropagation(); this._hangupCall(); }}>
                  挂断
                </button>`
              : html`
                <button class="action-btn answer" @click=${(e) => { e.stopPropagation(); this._answerCall(); }}>
                  接听
                </button>`}
          </div>
        </div>
      `;
    }

    // 全屏弹窗模式
    return html`
      <div class="popup-overlay" @click=${(e) => { if (e.target === e.currentTarget) this._dismissCallPopup(); }}>
        <div class="popup">
          <div class="popup-header ${headerClass}">
            <div class="popup-header-info">
              <div class="popup-calling-icon ${iconClass}">${this._callAnswered ? '通话' : '呼入'}</div>
              <div>
                <div class="popup-calling-label ${labelClass}">${labelText}</div>
                <div class="popup-device-name">${this._displayName}</div>
                <div class="popup-device-location">${this._floorLabel || ''}</div>
              </div>
            </div>
            <button class="popup-close" @click=${this._dismissCallPopup}>×</button>
          </div>

          <div class="video-frame">
            ${this._cameraUrl
              ? html`<img src="${this._cameraUrl}" alt="门禁视频" />`
              : html`
                <div class="video-overlay">
                  <div class="video-spinner"></div>
                  正在加载视频...
                </div>
              `}
          </div>

          <div class="popup-actions two-btn">
            <button class="action-btn unlock" @click=${this._unlockDoor}>
              解锁
            </button>
            ${answerBtn}
          </div>
        </div>
      </div>
    `;
  }

  /* =============== Monitor Video Popup =============== */

  _renderMonitorVideoPopup() {
    const door = this._getDoors().find(d => d.target_ip === this._monitorTargetIp) || {};
    const displayName = door.display_name || door.name || '监控中';

    return html`
      <div class="monitor-popup" @click=${(e) => { if (e.target === e.currentTarget) this._stopMonitor(); }}>
        <div class="monitor-popup-content">
          <div class="monitor-header">
            <div class="monitor-header-info">
              <div class="monitor-icon">监控</div>
              <div>
                <div class="monitor-title">${displayName}</div>
                <div class="monitor-subtitle">${door.floor_label || ''} · ${door.position_detail || ''}</div>
              </div>
            </div>
            <button class="popup-close" @click=${this._stopMonitor}>×</button>
          </div>

          <div class="video-frame">
            ${this._cameraUrl
              ? html`<img src="${this._cameraUrl}" alt="监控画面" />`
              : html`
                <div class="video-overlay">
                  <div class="video-spinner"></div>
                  正在加载视频...
                </div>
              `}
          </div>

          <div class="monitor-actions">
            <button class="action-btn stop" @click=${this._stopMonitor}>
              停止监控
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('doorlock-card')) {
  customElements.define('doorlock-card', DoorlockCard);
}
