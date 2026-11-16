import { Button } from 'antd'
import { ArrowRightOutlined, BookOutlined, SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import Header from '../components/common/Header';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Header />

      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-label">
              <BookOutlined /> BOOK NEST - YOUR READING COMMUNITY
            </span>
            <h1>
              Discover your next
              
            </h1>
            <p className="hero-description">
              Explore thousands of books, share your thoughts,
              and connect with readers who share your passion
              for literature
            </p>
            <div className="hero-actions">
              <Button type="primary" size="large" icon={<SearchOutlined />}
                      onClick={() => 
                        document.getElementById('discover')?.scrollIntoView({
                          behavior: 'smooth',
                        })
                      }>Explore
                </Button>
                <Link to="/register">
                   <Button size="large">
                      Join Our Community
                      <ArrowRightOutlined />
                   </Button>
                </Link>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000"
              alt="Cozy library with bookshelves"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;