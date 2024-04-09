import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import { SelectChangeEvent } from "@mui/material/Select";
import axiosInstance from "../api/axiosInstance";

type Post = {
  id: number;
  title: string;
  content: string;
  tags: any;
  postedAt: number;
  postedBy: string;
};

function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const postsPerPage = 5;

  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState('postedAt');
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, sortBy, tagSearchTerm]);

  const fetchPosts = async () => {
    try {
      const response = await axiosInstance.get("/post/getPost");
      const resData = await response.data.data.response;
      setPosts(resData);
      setDisplayedPosts(resData.slice(0, postsPerPage));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (filteredPosts.length > 0) {
      const newIndex = displayedPosts.length + postsPerPage;
      const newPosts = filteredPosts.slice(0, newIndex);
      setDisplayedPosts(newPosts);
      setShowAll(newIndex >= filteredPosts.length);
    } else {
      const newIndex = displayedPosts.length + postsPerPage;
      setDisplayedPosts(posts.slice(0, newIndex));
      setShowAll(newIndex >= posts.length);
    }
  };

  const handleOpenDialog = (post: Post) => {
    setSelectedPost(post);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleExpand = (postId: number) => {
    setExpandedPostId(postId === expandedPostId ? null : postId);
  };

  const isPostExpanded = (postId: number) => {
    return postId === expandedPostId;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setSearchTerm(event.target.value);
      setLoading(true);
      fetchPosts();
    } else {
      setSearchTerm(event.target.value);
    }
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value as string);
  };

  const handleTagSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagSearchTerm(event.target.value);
  };

  const filterAndSortPosts = () => {
    let filtered = posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (tagSearchTerm) {
      filtered = filtered.filter(post =>
        post.tags.some((tag: string) =>
          tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
        )
      );
    }

    if (sortBy === 'postedAtDesc') {
      filtered = filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    } else if (sortBy === 'postedAtAsc') {
      filtered = filtered.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
    } else if (sortBy === 'titleAsc') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'titleDesc') {
      filtered = filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredPosts(filtered);
    setDisplayedPosts(filtered.slice(0, postsPerPage));
  };

  return (
    <React.Fragment>
      <Box my={4} display="flex" alignItems="center" justifyContent="center">
        <Box mb={2} mt={2} mr={2}>
          <TextField
            label="Search Content"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>
        <Box mb={2} mt={2} mr={2}>
          <TextField
            label="Search Tags"
            variant="outlined"
            value={tagSearchTerm}
            onChange={handleTagSearchChange}
          />
        </Box>
        <Box mb={2} mt={2}>
          <FormControl variant="outlined">
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
            >
              <MenuItem value="postedAtDesc">Newest Date</MenuItem>
              <MenuItem value="postedAtAsc">Oldest Date</MenuItem>
              <MenuItem value="titleAsc">A - Z</MenuItem>
              <MenuItem value="titleDesc">Z - A</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box my={4} display="flex" alignItems="center" justifyContent="center">
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {displayedPosts.map((post) => (
              <React.Fragment key={post.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar alt="Avatar" src="/static/images/avatar/1.jpg" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        onClick={() => handleOpenDialog(post)}
                        style={{ cursor: "pointer", color: "#1976d2" }}
                      >
                        {post.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        {isPostExpanded(post.id) ? (
                          <Typography component="div">
                            <div
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                            <Button onClick={() => handleExpand(post.id)}>
                              Read less
                            </Button>
                          </Typography>
                        ) : (
                          <Typography component="div">
                            {post.content.length > 150 ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: `${post.content.substring(
                                    0,
                                    150
                                  )}...`,
                                }}
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: post.content,
                                }}
                              />
                            )}
                            {post.content.length > 150 && (
                              <Button onClick={() => handleExpand(post.id)}>
                                Read more
                              </Button>
                            )}
                          </Typography>
                        )}
                        <Box mb={1}>
                          <Typography
                            sx={{ display: "inline" }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Tags: {post.tags.join(", ")}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{ display: "inline" }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {post.postedBy}
                        </Typography>
                        {" — "}
                        {new Date(post.postedAt).toLocaleString()}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          {selectedPost && (
            <>
              <DialogTitle>
                <b>{selectedPost.title}</b>
              </DialogTitle>
              <DialogContent>
                <Typography>
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </Typography>
                <Typography variant="body2">
                  Tags: {selectedPost.tags.join(", ")}
                </Typography>
                <Typography variant="body2">
                  PostedAt: {new Date(selectedPost.postedAt).toLocaleString()}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
      {!showAll && (
        <Box mt={2} display="flex" alignItems="center" justifyContent="center">
          <Button variant="contained" onClick={loadMore}>
            Load More
          </Button>
        </Box>
      )}
    </React.Fragment>
  );
}

export default PostList;
