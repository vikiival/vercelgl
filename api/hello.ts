export default function hello(req, res) {
  res.statusCode = 200;
  res.json({ message: 'It works' });
}
