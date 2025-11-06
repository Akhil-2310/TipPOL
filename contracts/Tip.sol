// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tip {
    struct Post {
        uint256 id;
        address author;
        string achievement;
        string description;
        uint256 timestamp;
        uint256 tips;
        uint256 tipAmount;
    }

    mapping(uint256 => Post) public posts;
    mapping(address => uint256[]) public userPosts;
    uint256 public nextPostId;
    uint256[] public allPostIds;

    // Events
    event PostCreated(uint256 indexed postId, address indexed author, string achievement);
    event Tipped(uint256 indexed postId, address indexed from, address indexed to, uint256 amount);

    // Create a new post
    function createPost(string memory _achievement, string memory _description) external returns (uint256) {
        uint256 postId = nextPostId++;
        
        posts[postId] = Post({
            id: postId,
            author: msg.sender,
            achievement: _achievement,
            description: _description,
            timestamp: block.timestamp,
            tips: 0,
            tipAmount: 0
        });
        
        userPosts[msg.sender].push(postId);
        allPostIds.push(postId);
        
        emit PostCreated(postId, msg.sender, _achievement);
        return postId;
    }

    // Function to send a tip to a post author
    function tip(address payable _to) external payable {
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        // Send the tip to the recipient
        _to.transfer(msg.value);
        
        // Emit the tip event (we can add postId parameter later if needed)
        emit Tipped(0, msg.sender, _to, msg.value);
    }

    // Function to tip a specific post
    function tipPost(uint256 _postId) external payable {
        require(_postId < nextPostId, "Post does not exist");
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        Post storage post = posts[_postId];
        address payable author = payable(post.author);
        
        // Update post statistics
        post.tips += 1;
        post.tipAmount += msg.value;
        
        // Send the tip to the author
        author.transfer(msg.value);
        
        emit Tipped(_postId, msg.sender, author, msg.value);
    }

    // Get all posts (for feed)
    function getAllPosts() external view returns (Post[] memory) {
        Post[] memory result = new Post[](allPostIds.length);
        for (uint256 i = 0; i < allPostIds.length; i++) {
            result[i] = posts[allPostIds[i]];
        }
        return result;
    }

    // Get posts by user
    function getUserPosts(address _user) external view returns (Post[] memory) {
        uint256[] memory userPostIds = userPosts[_user];
        Post[] memory result = new Post[](userPostIds.length);
        
        for (uint256 i = 0; i < userPostIds.length; i++) {
            result[i] = posts[userPostIds[i]];
        }
        return result;
    }

    // Get a single post
    function getPost(uint256 _postId) external view returns (Post memory) {
        require(_postId < nextPostId, "Post does not exist");
        return posts[_postId];
    }

    // Get total number of posts
    function getTotalPosts() external view returns (uint256) {
        return nextPostId;
    }

    // Function to withdraw the balance of the contract (for emergency use)
    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Fallback function to accept ETH directly
    receive() external payable {}
}
