import Link from 'next/link'
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap'

// use the as to change the default HTML tag type so we don't end up with anchor tag within an anchor tag
const Header = () => (
  <Navbar bg='dark' variant='dark' expand='lg' id='header-nav-area'>
    <Container className='full-width-container hea' fluid bg='dark'>
      <Navbar.Brand as='span'>
        <Link href='/'>
          <a>
            <div className='brand-container'>
              <div className='brand-name'>3D Visualizer</div>
            </div>
          </a>
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse id='basic-navbar-nav'>
        <Nav className='ml-auto'>
          <Nav.Link as='span'>
            <Link href='/about'><a>Menu Link</a></Link>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>

)

export default Header
