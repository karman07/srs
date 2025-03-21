import React, { useEffect, useState } from 'react';
import RowContainer from '../components/RowContainer';
import { useData } from '../context/DataContext';
import { Item } from '../types/types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { TypeAnimation } from 'react-type-animation';

const HeartPage: React.FC = () => {
  const { getMenuItemById } = useData();
  const [items, setItems] = useState<Item[]>([]);

  const favoriteIds = useSelector((state: RootState) => state.favorite.favoriteItems);

  useEffect(() => {
    const fetchItems = async () => {
      if (favoriteIds.length) {
        const fetchedItems = await Promise.all(
          favoriteIds.map(async (id) => {
            const item = await getMenuItemById(id);
            return item;
          })
        );
        setItems(fetchedItems.filter(Boolean) as Item[]);
      }
    };

    fetchItems();
  }, [favoriteIds, getMenuItemById]);

  return (
    <div className="heart-page">
      <h2 className="title">
        <TypeAnimation
          sequence={[
            'Our Favorites ❤️', 
            1000,
          ]}
          wrapper="span"
          cursor={true}
          repeat={0}
          speed={50} // Typing speed
          className="typewriter"
        />
      </h2>

      <RowContainer 
        flag={false} 
        data={items} 
        scrollValue={0} 
      />
    </div>
  );
};

export default HeartPage;

// ✅ Updated CSS directly in the same file
const style = document.createElement('style');
style.innerHTML = `
  .heart-page {
    margin-top: 3rem; /* ✅ Added margin from top */
    padding: 2rem 0;
    text-align: center;
  }

  .title {
    font-size: 2.5rem;
    font-weight: bold;
    color: black;
    display: inline-block;
    margin-bottom: 1.5rem;
    letter-spacing: 0.5px;
  }

  .typewriter {
    display: inline-block;
  }
`;
document.head.appendChild(style);
