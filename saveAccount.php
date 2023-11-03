<!-- PHP code to establish connection with the localserver -->
<?php

// Username is root
$user = 'phpmyadmin';
$password = 'WebSysG4!';

// Database name is geeksforgeeks
$database = 'Accounts';

// Server is localhost with
// port number 3306
$servername='localhost:3306';
$mysqli = new mysqli($servername, $user,
				$password, $database);

// Checking for connections
if ($mysqli->connect_error) {
	die('Connect Error (' .
	$mysqli->connect_errno . ') '.
	$mysqli->connect_error);
}

$display = mysqli_real_escape_string($conn, $_POST['display']);
$email = mysqli_real_escape_string($conn, $_POST['email']);

// SQL query to select data from database
$sql = " SELECT `display`, `email` FROM `users`";
$result = $mysqli->query($sql);
$mysqli->close();

$mysqli2 = new mysqli($servername, $user,
				$password, $database);

if ($mysqli2->connect_error) {
	die('Connect Error (' .
	$mysqli2->connect_errno . ') '.
	$mysqli2->connect_error);
}

$sql2= " INSERT INTO `users`(`display`, `email`) VALUES ('$display','$email') ";
$result2 = $mysqli2->query($sql2);
$mysqli2->close();
?>

<!-- HTML code to display data in tabular format -->
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<title>ACCOUNTS</title>
	<!-- CSS FOR STYLING THE PAGE -->
	<style>
		table {
			margin: 0 auto;
			font-size: large;
			border: 1px solid black;
		}

		h1 {
			text-align: center;
			color: #006600;
			font-size: xx-large;
			font-family: 'Gill Sans', 'Gill Sans MT',
			' Calibri', 'Trebuchet MS', 'sans-serif';
		}

		td {
			background-color: #E4F5D4;
			border: 1px solid black;
		}

		th,
		td {
			font-weight: bold;
			border: 1px solid black;
			padding: 10px;
			text-align: center;
		}

		td {
			font-weight: lighter;
		}
	</style>
</head>

<body>
	<section>
		<h1>ACCOUNTS</h1>
		<!-- TABLE CONSTRUCTION -->
		<table>
			<tr>
				<th>DISPLAYNAME</th>
				<th>EMAIL</th>
			</tr>
			<!-- PHP CODE TO FETCH DATA FROM ROWS -->
			<?php
				// LOOP TILL END OF DATA
				while($rows=$result->fetch_assoc())
				{
			?>
			<tr>
				<!-- FETCHING DATA FROM EACH
					ROW OF EVERY COLUMN -->
				<td><?php echo $rows['display'];?></td>
				<td><?php echo $rows['email'];?></td>
			</tr>
			<?php
				}
			?>
		</table>

	</section>
</body>

</html>
