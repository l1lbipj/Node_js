import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Button, Card, Typography, /*Space*/ } from 'antd'
import Home from '../pages/Home';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';

const { Title, Paragraph } = Typography;

const PagePlaceholder = ({ title }) => {
    return (
        <div style={{ padding: 40, textAlign: 'center'}}>
            <Card style={{ maxWidth: 600, margin: '0 auto'}}>
                <Title level={2}>{title}</Title>
                <Paragraph>Welcome to Book Nest!!!!!!!!!!!</Paragraph>
                <Link to="/">
                   <Button type="primary">Back</Button>
                </Link>
            </Card>
        </div>
    )
}

// const HomePage = () => {
//     return (
//         <div style={{ padding: 40, textAlign: 'center'}}>
//             <Card style={{ maxWidth: 700, margin: '0 auto'}}>
//                 <Title level={2}>Welcome to Book Nest</Title>
//                 <Paragraph>Book Review and Publisher Portal</Paragraph>
//                 <Space wrap>
//                     <Link to="/login">
//                         <Button type="primary">Dang Nhap</Button>
//                     </Link>
//                     <Link to="/register">
//                         <Button>Dang ky</Button>
//                     </Link>
//                     <Link to="/admin">
//                         <Button>Admin</Button>
//                     </Link>
//                     <Link to="/reader">
//                         <Button>Reader</Button>
//                     </Link>
//                     <Link to="/publisher">
//                         <Button>Publisher</Button>
//                     </Link>
//                 </Space>
//             </Card>
//         </div>
//     )
// }

//cau hinh router
function AppRouter(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />}/>
                <Route path="/admin" element={<PagePlaceholder title ="admin"/>}/>
                <Route path="/reader" element={<PagePlaceholder title="reader"/>}/>
                <Route path="/publisher" element={<PagePlaceholder title="publisher"/>}/>
                <Route path="*" element={<PagePlaceholder title="404 - Khong tim thay trang" />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;