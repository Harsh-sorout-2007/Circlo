import { Card } from '../components/ui/Card';
import './Sidebar.css';

export const Sidebar = ({ children }) => {
  return (
    <aside className="sidebar">
      {children || (
        <Card className="sidebar-card">
          <div className="sidebar-header">
            <h3>Home</h3>
          </div>
          <div className="sidebar-body">
            <p>Your personal Circlo frontpage. Come here to check in with your favorite communities.</p>
          </div>
        </Card>
      )}
    </aside>
  );
};