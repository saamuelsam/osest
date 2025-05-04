import { useState, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from '@chakra-ui/react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Flex h="100vh">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <Box
          w="240px"
          bg="white"
          boxShadow="sm"
          h="100vh"
          position="fixed"
          left={0}
          top={0}
        >
          <Sidebar />
        </Box>
      )}

      {/* Drawer for mobile */}
      {isMobile && (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
            <DrawerBody p={0}>
              <Sidebar />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Main content */}
      <Box
        flex="1"
        ml={isMobile ? 0 : "240px"}
        transition="margin-left 0.3s"
        bg="brand.background"
        minH="100vh"
      >
        <Navbar
          menuButton={
            isMobile && (
              <IconButton
                aria-label="Open menu"
                icon={<Menu />}
                variant="ghost"
                onClick={onOpen}
                mr={2}
              />
            )
          }
        />
        <Box p={4} pt={20}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;